import { NextRequest, NextResponse } from 'next/server';
import { learningsStore } from '@/lib/stores/learningsStore';
import { getLogger } from '@/lib/observability/logger';

const logger = getLogger();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const publicOnly = searchParams.get('public') === 'true';

  try {
    const learnings = await learningsStore.getLearnings(slug);
    return NextResponse.json({ learnings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error fetching learnings for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to fetch learnings', details: message },
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
    const { title, description, evidence = [], isPublic = false } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description' },
        { status: 400 }
      );
    }

    const learning = await learningsStore.addLearning(
      slug,
      title,
      description,
      evidence,
      isPublic
    );

    logger.info(`Learning created for ${slug}: ${title}`, {
      experimentSlug: slug,
      isPublic,
    });

    return NextResponse.json(learning);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error creating learning for ${slug}`, { error: message });

    return NextResponse.json(
      { error: 'Failed to create learning', details: message },
      { status: 500 }
    );
  }
}
