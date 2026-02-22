'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Keep this from next/navigation for client-side search params
import { Link } from '@/i18n/navigation'; // Use localized Link
import { decodeShareData, encodeReproInput, type ShareableData } from '@/lib/share';
import { AlertCircle, ArrowLeft, ExternalLink, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ResultDisplay } from '@/components/ResultDisplay';
import type { ExecutionResult } from '@/types/experiments';

function ShareContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ShareableData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('SharePage');

  useEffect(() => {
    const encoded = searchParams.get('d');
    if (!encoded) {
      setError(t('invalidLink.noData'));
      setLoading(false);
      return;
    }

    const decoded = decodeShareData(encoded);
    if (!decoded) {
      setError(t('invalidLink.corrupted'));
      setLoading(false);
      return;
    }

    setData(decoded);
    setLoading(false);
  }, [searchParams, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('invalidLink.title')}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('invalidLink.goHome')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { experimentName, result, metadata, timestamp } = data;

  // Reconstruct ExecutionResult for ResultDisplay
  const executionResult: ExecutionResult = {
    ...result,
    executionId: 'shared-result',
    metadata: {
      ...metadata,
      inputTokens: (metadata as any).inputTokens || 0,
      outputTokens: (metadata as any).outputTokens || 0,
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToLab')}
              </Link>
              <h1 className="text-2xl font-bold text-foreground">
                {t('sharedResult')}: {experimentName}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {data.input && Object.keys(data.input).length > 0 && (
                <Link
                  href={`/experiments/${data.experimentSlug}?repro=${encodeReproInput(data.input)}`}
                >
                  <Button variant="default" size="sm" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    {t('reproduce')}
                  </Button>
                </Link>
              )}
              <Link href={`/experiments/${data.experimentSlug}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {t('tryExperiment')}
                </Button>
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('sharedAt', { date: new Date(timestamp).toLocaleString() })}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <ResultDisplay
          result={executionResult}
          experimentSlug={data.experimentSlug}
          experimentName={experimentName}
        />

        {/* CTA */}
        <div className="mt-8 text-center pt-8 border-t border-border">
          <p className="text-muted-foreground mb-4">
            {t('cta.text')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {data.input && Object.keys(data.input).length > 0 && (
              <Link
                href={`/experiments/${data.experimentSlug}?repro=${encodeReproInput(data.input)}`}
              >
                <Button size="lg" variant="default" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  {t('reproduce')}
                </Button>
              </Link>
            )}
            <Link href={`/experiments/${data.experimentSlug}`}>
              <Button size="lg" variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                {t('cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SharePage() {
  const t = useTranslations('SharePage');

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
