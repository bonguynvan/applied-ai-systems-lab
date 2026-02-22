import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';

import { getExperimentBySlug } from '@/config/experiments';
import { callAI } from '@/lib/ai/orchestrator';
import { getCachedResult, setCachedResult } from '@/lib/cache/manager';
import { getLogger } from '@/lib/observability/logger';
import { hashInput } from '@/lib/utils/hash';
import { analyticsStore } from '@/lib/stores/analyticsStore';
import { featureToggleStore } from '@/lib/stores/featureToggleStore';
import { rateLimit, getRateLimitStatus } from '@/lib/rate-limit';

const logger = getLogger();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const startTime = performance.now();
  const executionId = randomUUID();

  // Rate limiting - check IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await rateLimit(ip);

  if (!rateLimitResult.allowed) {
    const resetInSeconds = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
    logger.warn('Rate limit exceeded', { ip, slug, resetIn: resetInSeconds });
    return NextResponse.json(
      {
        error: 'Too many requests',
        details: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${resetInSeconds} giây.`,
        resetInSeconds,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  }

  try {
    // Get experiment
    const experiment = getExperimentBySlug(slug);
    if (!experiment) {
      return NextResponse.json(
        { error: `Experiment not found: ${slug}` },
        { status: 404 }
      );
    }

    // Parse and validate input
    let input;
    let model = 'gpt-4o'; // Default model

    try {
      const body = await request.json();

      // Extract model if present
      if (body.model && typeof body.model === 'string') {
        model = body.model;
      }

      // Parse input using schema (Zod strips unknown keys by default)
      input = experiment.inputSchema.parse(body);
    } catch (error: unknown) {
      let details = error instanceof Error ? error.message : 'Validation failed';

      if (error instanceof ZodError) {
        // Format Zod error into a readable string
        details = error.errors
          .map((issue) => {
            const field = issue.path.join('.');
            return `${field ? field + ': ' : ''}${issue.message}`;
          })
          .join(', ');
      }

      logger.error('Invalid input', {
        experimentSlug: slug,
        error: details,
      });

      return NextResponse.json(
        {
          error: 'Invalid input',
          details: details,
        },
        { status: 400 }
      );
    }

    // Generate cache key and check cache
    // Include model in the hash to ensure different models have different cache entries
    const inputHash = await hashInput({ ...input, model });
    const cacheKey = `experiment:${slug}:${inputHash}`;
    const cachedResult = await getCachedResult(cacheKey, input);

    if (cachedResult) {
      logger.logExperiment({
        timestamp: Date.now(),
        level: 'info',
        message: `Cache hit for ${slug}`,
        experimentSlug: slug,
        inputHash,
        metadata: {
          latency: performance.now() - startTime,
          cacheHit: true,
          model: 'cached',
        },
      });

      // Record analytics for cached hit
      await analyticsStore.recordExecution(
        slug,
        performance.now() - startTime,
        0, // cached results have no cost
        0, // no tokens for cached results
        true
      );

      return NextResponse.json({
        success: true,
        data: cachedResult,
        executionId,
        metadata: {
          latency: performance.now() - startTime,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costEstimate: 0,
          cached: true,
          model: 'cached',
        },
      });
    }

    // Generate prompt
    const prompt = experiment.prompt(input);

    // Extract user keys from headers if present
    const userKeys = {
      openai: request.headers.get('X-OpenAI-Key') || undefined,
      anthropic: request.headers.get('X-Anthropic-Key') || undefined,
      google: request.headers.get('X-Gemini-Key') || undefined,
      groq: request.headers.get('X-Groq-Key') || undefined,
    };

    // Call AI
    const aiResult = await callAI(model, prompt, {
      temperature: 0.7,
      maxTokens: 2000,
      userKeys: userKeys, // Pass user keys to orchestrator
    });

    // Parse output
    let output;
    try {
      output = experiment.handler(aiResult.content, input);
      output = experiment.outputSchema.parse(output);
    } catch (error) {
      logger.error('Failed to parse output', {
        experimentSlug: slug,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return NextResponse.json(
        {
          error: 'Failed to process result',
          details:
            error instanceof Error ? error.message : 'Processing failed',
        },
        { status: 500 }
      );
    }

    // Cache result
    await setCachedResult(cacheKey, input, output);

    const latency = performance.now() - startTime;

    // Record analytics
    await analyticsStore.recordExecution(
      slug,
      latency,
      aiResult.cost,
      aiResult.usage.totalTokens,
      false
    );

    // Log experiment execution
    logger.logExperiment({
      timestamp: Date.now(),
      level: 'info',
      message: `Completed experiment: ${slug}`,
      experimentSlug: slug,
      inputHash,
      outputHash: (await hashInput(output)).substring(0, 8),
      metadata: {
        latency,
        inputTokens: aiResult.usage.inputTokens,
        outputTokens: aiResult.usage.outputTokens,
        costEstimate: aiResult.cost,
        cacheHit: false,
        model: model,
      },
    });

    return NextResponse.json({
      success: true,
      data: output,
      executionId,
      metadata: {
        latency,
        inputTokens: aiResult.usage.inputTokens,
        outputTokens: aiResult.usage.outputTokens,
        totalTokens: aiResult.usage.totalTokens,
        costEstimate: aiResult.cost,
        cached: false,
        model: model,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`API error in experiment ${slug}`, { error: message });

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const experiment = getExperimentBySlug(slug);

  if (!experiment) {
    return NextResponse.json(
      { error: `Experiment not found: ${slug}` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    metadata: experiment.metadata,
    inputSchema: {
      description: 'Input schema for this experiment',
      // Note: Zod schemas can't be directly serialized, so we return a description
      fields: 'See form on experiment page',
    },
  });
}
