import { NextRequest, NextResponse } from 'next/server';
import { featureToggleStore } from '@/lib/stores/featureToggleStore';
import { getLogger } from '@/lib/observability/logger';

const logger = getLogger();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const toggles = await featureToggleStore.getToggles(slug);
    return NextResponse.json({ toggles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error fetching toggles for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to fetch toggles', details: message },
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
    const { name, description, enabled = false, rolloutPercentage = 100, variants } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    const toggle = await featureToggleStore.createToggle(
      slug,
      name,
      description,
      enabled,
      rolloutPercentage,
      variants
    );

    logger.info(`Feature toggle created for ${slug}: ${name}`, {
      experimentSlug: slug,
      toggleName: name,
      enabled,
    });

    return NextResponse.json(toggle);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error creating toggle for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to create toggle', details: message },
      { status: 500 }
    );
  }
}
