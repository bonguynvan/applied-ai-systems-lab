import { NextRequest, NextResponse } from 'next/server';
import { experimentStateStore } from '@/lib/stores/experimentStateStore';
import { getLogger } from '@/lib/observability/logger';

const logger = getLogger();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const state = await experimentStateStore.getState(slug);

  if (!state) {
    return NextResponse.json(
      { error: `No state found for experiment: ${slug}` },
      { status: 404 }
    );
  }

  return NextResponse.json(state);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { state, goals, hypothesis } = body;

    if (!state) {
      return NextResponse.json(
        { error: 'Missing required field: state' },
        { status: 400 }
      );
    }

    const newState = await experimentStateStore.setState(slug, state, goals, hypothesis);

    logger.info(`State updated for ${slug}: ${state}`, {
      experimentSlug: slug,
      state,
    });

    return NextResponse.json(newState);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error updating state for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to update state', details: message },
      { status: 500 }
    );
  }
}
