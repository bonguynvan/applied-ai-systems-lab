import { NextRequest, NextResponse } from 'next/server';
import { promptIterationStore } from '@/lib/stores/promptIterationStore';
import { getLogger } from '@/lib/observability/logger';

const logger = getLogger();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const compare = searchParams.get('compare');

  try {
    const iterations = await promptIterationStore.getIterations(slug);
    const current = await promptIterationStore.getCurrentVersion(slug);

    if (compare) {
      const [v1Str, v2Str] = compare.split(',');
      const v1 = parseInt(v1Str, 10);
      const v2 = parseInt(v2Str, 10);

      // Note: comparison logic could be moved to store or kept here. 
      // Simplified returning iterations for now as the front-end handles comparisons usually.

      const it1 = iterations.find(i => i.version === v1);
      const it2 = iterations.find(i => i.version === v2);

      const comparison = it1 && it2 ? {
        v1: it1,
        v2: it2,
        latencyChange: it2.metrics.latencyChange,
        qualityChange: it2.metrics.qualityChange,
        costChange: it2.metrics.costChange,
      } : null;
      return NextResponse.json({
        iterations,
        currentVersion: current,
        comparison,
      });
    }

    return NextResponse.json({
      iterations,
      currentVersion: current,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error fetching iterations for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to fetch iterations', details: message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { promptText, reasoning, metrics } = body;

    if (!promptText || !reasoning) {
      return NextResponse.json(
        { error: 'Missing required fields: promptText, reasoning' },
        { status: 400 }
      );
    }

    const iteration = await promptIterationStore.createIteration(
      slug,
      promptText,
      reasoning,
      metrics
    );

    logger.info(`New iteration created for ${slug}: v${iteration.version}`, {
      experimentSlug: slug,
      version: iteration.version,
    });

    return NextResponse.json(iteration);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error creating iteration for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to create iteration', details: message },
      { status: 500 }
    );
  }
}
