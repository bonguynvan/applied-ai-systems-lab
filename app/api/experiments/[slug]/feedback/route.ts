import { NextRequest, NextResponse } from 'next/server';
import { feedbackStore } from '@/lib/stores/feedbackStore';
import { getLogger } from '@/lib/observability/logger';

const logger = getLogger();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const feedback = await feedbackStore.getFeedback(slug);
  const avgRating = await feedbackStore.getAverageRating(slug);
  const distribution = await feedbackStore.getRatingDistribution(slug);

  return NextResponse.json({
    feedback,
    summary: {
      totalFeedback: feedback.length,
      avgRating,
      distribution,
      positiveComments: await feedbackStore.getPositiveComments(slug),
      negativeComments: await feedbackStore.getNegativeComments(slug),
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { executionId, rating, comment } = body;

    if (!executionId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: executionId, rating (1-5)' },
        { status: 400 }
      );
    }

    const feedback = await feedbackStore.addFeedback(slug, executionId, rating, comment);

    logger.info(`Feedback recorded for ${slug}`, {
      experimentSlug: slug,
      rating,
      hasComment: !!comment,
    });

    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error recording feedback for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to record feedback', details: message },
      { status: 500 }
    );
  }
}
