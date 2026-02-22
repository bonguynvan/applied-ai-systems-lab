import { NextResponse } from 'next/server';
import { isRedisConfigured } from '@/lib/redis';

export async function GET() {
  try {
    const providers = {
      openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-...',
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    };

    const configuredCount = Object.values(providers).filter(Boolean).length;
    const ready = configuredCount > 0;

    return NextResponse.json({
      ready,
      providers,
      configuredCount,
      totalProviders: 4,
      redis: isRedisConfigured(),
    });
  } catch (error) {
    return NextResponse.json({
      ready: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: true,
    }, { status: 500 });
  }
}
