'use server';

import { generateText } from 'ai';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import type { AICallOptions, AICallResult } from '@/types/ai';
import { getModelConfig, calculateCost } from '@/lib/config/models';
import { estimateTokens } from '@/lib/utils/hash';
import { getRedis } from '@/lib/redis';

// Rate Limiting & Budget Protection
const MAX_INPUT_LENGTH = 10000; // 10,000 characters
const MAX_TOKENS_PER_REQUEST = 4000;
const MAX_COST_PER_REQUEST = 0.20; // $0.20 per request
const DAILY_BUDGET_LIMIT = 5.0; // $5.00 per day

const BUDGET_KEY_PREFIX = 'ai-lab:budget:';
const BUDGET_TTL_SEC = 25 * 60 * 60; // 25 hours so key expires next day

// In-memory fallback when Redis is not configured
let dailyCost = 0;
let lastResetDate = new Date().toISOString().split('T')[0];

function getBudgetKey(): string {
  return BUDGET_KEY_PREFIX + new Date().toISOString().split('T')[0];
}

async function getDailySpentRedis(): Promise<number> {
  const redis = getRedis();
  if (!redis) return dailyCost;
  const raw = await redis.get(getBudgetKey());
  if (raw == null) return 0;
  const n = parseFloat(String(raw));
  return Number.isFinite(n) ? n : 0;
}

async function addDailyCostRedis(cost: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const key = getBudgetKey();
  await redis.incrbyfloat(key, cost);
  await redis.expire(key, BUDGET_TTL_SEC);
}

function checkAndResetDailyBudget() {
  const today = new Date().toISOString().split('T')[0];
  if (today !== lastResetDate) {
    dailyCost = 0;
    lastResetDate = today;
  }
}

export async function getBudgetStatus(): Promise<{ spent: number; limit: number; remaining: number }> {
  const redis = getRedis();
  if (redis) {
    const spent = await getDailySpentRedis();
    return {
      spent,
      limit: DAILY_BUDGET_LIMIT,
      remaining: Math.max(0, DAILY_BUDGET_LIMIT - spent),
    };
  }
  checkAndResetDailyBudget();
  return {
    spent: dailyCost,
    limit: DAILY_BUDGET_LIMIT,
    remaining: Math.max(0, DAILY_BUDGET_LIMIT - dailyCost),
  };
}

// API Key checking
function getAPIKeys() {
  return {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    groq: process.env.GROQ_API_KEY,
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  };
}

// Check if API keys are configured
export async function checkAPIConfiguration(): Promise<{ ready: boolean; missing: string[] }> {
  const keys = getAPIKeys();
  const missing: string[] = [];

  // At least one provider should be configured
  if (!keys.openai) missing.push('OPENAI_API_KEY');
  if (!keys.anthropic) missing.push('ANTHROPIC_API_KEY');
  if (!keys.groq) missing.push('GROQ_API_KEY');
  if (!keys.google) missing.push('GOOGLE_GENERATIVE_AI_API_KEY');

  return {
    ready: Object.values(keys).some(k => !!k),
    missing,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get provider instance based on model
function getProvider(model: string, userKeys?: AICallOptions['userKeys']) {
  const keys = getAPIKeys();

  if (model.startsWith('gpt-')) {
    const apiKey = userKeys?.openai || keys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    // If using user key, we need to create a custom provider
    if (userKeys?.openai) {
      return createOpenAI({ apiKey: userKeys.openai })(model);
    }
    return openai(model);
  }

  if (model.startsWith('claude-')) {
    const apiKey = userKeys?.anthropic || keys.anthropic;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    if (userKeys?.anthropic) {
      return createAnthropic({ apiKey: userKeys.anthropic })(model);
    }
    return anthropic(model);
  }

  if (
    model.includes('groq') ||
    model.includes('mixtral') ||
    model.includes('llama') ||
    model.includes('qwen') ||
    model.startsWith('openai/gpt-oss')
  ) {
    const apiKey = userKeys?.groq || keys.groq;
    if (!apiKey) {
      throw new Error('GROQ API key not configured');
    }
    const groq = createOpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    return groq(model);
  }

  if (model.startsWith('gemini-')) {
    const apiKey = userKeys?.google || keys.google;
    if (!apiKey) {
      throw new Error('Google Generative AI API key not configured');
    }
    if (userKeys?.google) {
      return createGoogleGenerativeAI({ apiKey: userKeys.google })(model);
    }
    return google(model);
  }

  throw new Error(`Unsupported model: ${model}`);
}

// Map model names to provider format
function normalizeModelName(model: string): string {
  // Map friendly names to actual model IDs
  const modelMap: Record<string, string> = {
    'gpt-4o': 'gpt-4o',
    'gpt-4-turbo': 'gpt-4-turbo',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307',
    'groq-mixtral': 'mixtral-8x7b-32768',
    'gemini-1.5-pro': 'models/gemini-1.5-pro-latest',
    'gemini-1.5-flash': 'models/gemini-1.5-flash-latest',
  };

  return modelMap[model] || model;
}

export async function callAI(
  model: string,
  prompt: string,
  options: AICallOptions = {}
): Promise<AICallResult> {
  // Validate input length
  if (prompt.length > MAX_INPUT_LENGTH) {
    throw new Error(
      `Input quá dài. Giới hạn ${MAX_INPUT_LENGTH.toLocaleString()} ký tự, nhưng bạn đã gửi ${prompt.length.toLocaleString()} ký tự.`
    );
  }

  const usingUserKey =
    !!options.userKeys &&
    !!(
      options.userKeys.openai ||
      options.userKeys.anthropic ||
      options.userKeys.groq ||
      options.userKeys.google
    );

  // Check daily budget only when using shared server-side keys
  if (!usingUserKey) {
    if (!getRedis()) checkAndResetDailyBudget();
    const currentSpent = getRedis() ? await getDailySpentRedis() : dailyCost;
    if (currentSpent >= DAILY_BUDGET_LIMIT) {
      throw new Error(
        `Đã đạt giới hạn ngân sách hôm nay ($${DAILY_BUDGET_LIMIT}). Vui lòng thử lại vào ngày mai.`
      );
    }
  }

  const startTime = performance.now();
  const normalizedModel = normalizeModelName(model);

  const {
    temperature = 0.7,
    maxTokens = 2000,
    topP = 1,
    retryCount = 3,
  } = options;

  // Validate max tokens
  if (maxTokens > MAX_TOKENS_PER_REQUEST) {
    throw new Error(
      `maxTokens vượt quá giới hạn ${MAX_TOKENS_PER_REQUEST}`
    );
  }

  // Pre-check estimated cost only for shared keys
  if (!usingUserKey) {
    const estimatedInputTokens = estimateTokens(prompt);
    const estimatedCost = calculateCost(model, estimatedInputTokens, maxTokens);
    if (estimatedCost > MAX_COST_PER_REQUEST) {
      throw new Error(
        `Request này ước tính tốn $${estimatedCost.toFixed(4)}, vượt quá giới hạn $${MAX_COST_PER_REQUEST} mỗi request.`
      );
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      // Get provider for this model with optional user keys
      const provider = getProvider(normalizedModel, options.userKeys);

      // Call AI with timeout
      const response = await Promise.race([
        generateText({
          model: provider,
          prompt,
          temperature,
          maxTokens,
          topP,
        } as any),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 30s')), 30000)
        ),
      ]);

      const latency = performance.now() - startTime;

      // Calculate tokens
      const inputTokens = estimateTokens(prompt);
      const outputTokens = estimateTokens(response.text);
      const totalTokens = inputTokens + outputTokens;

      // Calculate cost
      const cost = calculateCost(model, inputTokens, outputTokens);

      // Track daily cost (Redis or in-memory) only for shared keys
      if (!usingUserKey) {
        if (getRedis()) {
          await addDailyCostRedis(cost);
        } else {
          dailyCost += cost;
        }
      }

      return {
        content: response.text,
        model,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
        },
        finishReason: 'stop',
        latency,
        cost,
        cached: false,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(
        `[Orchestrator] Attempt ${attempt + 1} failed for ${model}:`,
        lastError.message
      );

      // Check if it's an API key error
      if (lastError.message.includes('API key') || lastError.message.includes('authentication')) {
        throw new Error(`API configuration error: ${lastError.message}`);
      }

      if (attempt < retryCount - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 4000);
        console.log(`[Orchestrator] Retrying in ${delayMs}ms...`);
        await sleep(delayMs);
      }
    }
  }

  throw new Error(
    `Failed to call AI after ${retryCount} attempts: ${lastError?.message}`
  );
}

export async function estimateTokensForText(text: string): Promise<number> {
  return estimateTokens(text);
}

// Test function to verify connection
export async function testAIConnection(model: string = 'gpt-4o'): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> {
  try {
    const startTime = performance.now();
    await callAI(model, 'Say "OK" if you can hear me.', {
      maxTokens: 10,
      retryCount: 1,
    });
    const latency = performance.now() - startTime;

    return {
      success: true,
      message: `Connected successfully to ${model}`,
      latency,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
