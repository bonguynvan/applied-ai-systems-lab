import { NextRequest, NextResponse } from 'next/server';
import { featureToggleStore } from '@/lib/stores/featureToggleStore';
import { getLogger } from '@/lib/observability/logger';

const logger = getLogger();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; name: string }> }
) {
  const { slug, name } = await params;

  try {
    const toggle = await featureToggleStore.getToggle(slug, name);

    if (!toggle) {
      return NextResponse.json(
        { error: `Toggle not found: ${name}` },
        { status: 404 }
      );
    }

    return NextResponse.json(toggle);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error fetching toggle for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to fetch toggle', details: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; name: string }> }
) {
  const { slug, name } = await params;

  try {
    const body = await request.json();
    const { enabled, rolloutPercentage } = body;

    let toggle = null;

    if (enabled !== undefined) {
      toggle = await featureToggleStore.setEnabled(slug, name, enabled);
      logger.info(`Toggle ${name} set to ${enabled} for ${slug}`, {
        experimentSlug: slug,
        toggleName: name,
      });
    }

    if (rolloutPercentage !== undefined) {
      toggle = await featureToggleStore.setRolloutPercentage(slug, name, rolloutPercentage);
      logger.info(`Rollout percentage for ${name} set to ${rolloutPercentage}% for ${slug}`, {
        experimentSlug: slug,
        toggleName: name,
      });
    }

    if (!toggle) {
      return NextResponse.json(
        { error: `Toggle not found: ${name}` },
        { status: 404 }
      );
    }

    return NextResponse.json(toggle);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error updating toggle for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to update toggle', details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; name: string }> }
) {
  const { slug, name } = await params;

  try {
    const deleted = await featureToggleStore.deleteToggle(slug, name);

    if (!deleted) {
      return NextResponse.json(
        { error: `Toggle not found: ${name}` },
        { status: 404 }
      );
    }

    logger.info(`Toggle ${name} deleted for ${slug}`, {
      experimentSlug: slug,
      toggleName: name,
    });

    return NextResponse.json({ success: true, message: `Toggle ${name} deleted` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error deleting toggle for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to delete toggle', details: message },
      { status: 500 }
    );
  }
}
