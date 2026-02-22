import { NextRequest, NextResponse } from 'next/server';
import { analyticsStore } from '@/lib/stores/analyticsStore';
import { getLogger } from '@/lib/observability/logger';

const logger = getLogger();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get('days') || '30', 10);

  try {
    const metrics = await analyticsStore.getMetrics(slug);
    const dailySnapshots = await analyticsStore.getDailySnapshots(slug, days);

    if (!metrics) {
      return NextResponse.json({
        metrics: null,
        dailySnapshots: [],
        message: 'No metrics available yet',
      });
    }

    return NextResponse.json({
      metrics,
      dailySnapshots,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error fetching analytics for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: message },
      { status: 500 }
    );
  }
}
