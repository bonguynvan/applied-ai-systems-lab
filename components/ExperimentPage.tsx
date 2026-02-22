'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import type { ExperimentMetadata, ExecutionResult } from '@/types/experiments';
import { ExperimentForm } from '@/components/ExperimentForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { StateIndicator } from '@/components/StateIndicator';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { IterationTimeline } from '@/components/IterationTimeline';
import { LearningsTab } from '@/components/LearningsTab';
import { FeatureToggleControl } from '@/components/FeatureToggleControl';
import { ApiTab } from '@/components/ApiTab';
import { HistoryPanel } from '@/components/HistoryPanel';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { SettingsModal } from '@/components/SettingsModal';
import type { ExperimentLifecycleState } from '@/types/experimentation';
import {
  prefetchAnalytics,
  prefetchIterations,
  prefetchLearnings,
  prefetchToggles,
} from '@/lib/hooks/useExperimentData';
import { UserGuide } from '@/components/UserGuide';
import { ResultSkeleton } from '@/components/ResultSkeleton';
import { saveToHistory } from '@/lib/history';
import { useTranslations } from 'next-intl';
import { getUserSettings } from '@/lib/settings';
import { decodeReproInput } from '@/lib/share';
import type { ErrorType } from '@/types/experiments';

function getErrorType(status: number, details: string): ErrorType {
  if (status === 429) return 'rate_limit';
  if (status === 400) return 'validation';
  if (status === 401 || status === 403) return 'api_key';
  const d = (details || '').toLowerCase();
  if (d.includes('api key') || d.includes('authentication') || d.includes('api configuration')) return 'api_key';
  if (d.includes('ngân sách') || d.includes('budget') || (d.includes('giới hạn') && d.includes('$'))) return 'budget';
  if (status >= 500) return 'server';
  if (status === 0) {
    if (d.includes('api key') || d.includes('authentication')) return 'api_key';
    if (d.includes('budget') || d.includes('ngân sách')) return 'budget';
    return 'server';
  }
  return 'server';
}

interface ExperimentPageProps {
  experiment: ExperimentMetadata;
  /** Base64url-encoded input from ?repro= (share page "Reproduce") */
  reproEncoded?: string | null;
}

type TabType = 'run' | 'api' | 'analytics' | 'iterations' | 'learnings' | 'settings';

const ExperimentPage = memo(function ExperimentPage({ experiment, reproEncoded }: ExperimentPageProps) {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('run');
  const [state] = useState<ExperimentLifecycleState>('Building');
  const [lastInput, setLastInput] = useState<Record<string, any> | null>(null);
  const [formKey, setFormKey] = useState(0); // Used to force re-render form with loaded history
  const t = useTranslations('ExperimentPage');
  const tExperiments = useTranslations('Experiments');

  // Apply ?repro= input from share page "Reproduce" link
  useEffect(() => {
    if (!reproEncoded?.trim()) return;
    const decoded = decodeReproInput(reproEncoded.trim());
    if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) {
      setLastInput(decoded);
      setFormKey((k) => k + 1);
    }
  }, [reproEncoded]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);

    // Prefetch data when switching tabs
    if (tab === 'analytics') prefetchAnalytics(experiment.slug);
    if (tab === 'iterations') prefetchIterations(experiment.slug);
    if (tab === 'learnings') prefetchLearnings(experiment.slug);
    if (tab === 'settings') prefetchToggles(experiment.slug);
  }, [experiment.slug]);

  const handleLoadHistory = useCallback((input: Record<string, any>) => {
    setLastInput(input);
    setResult(null); // Clear previous result
    setFormKey(prev => prev + 1); // Force form re-render with new input
  }, []);

  const handleSubmit = useCallback(async (input: any) => {
    setLoading(true);
    setResult(null);
    setLastInput(input);

    try {
      const settings = getUserSettings();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (settings.openaiKey) headers['X-OpenAI-Key'] = settings.openaiKey;
      if (settings.anthropicKey) headers['X-Anthropic-Key'] = settings.anthropicKey;
      if (settings.geminiKey) headers['X-Gemini-Key'] = settings.geminiKey;
      if (settings.groqKey) headers['X-Groq-Key'] = settings.groqKey;

      const response = await fetch(`/api/experiments/${experiment.slug}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details || data.error || t('error.default');
        const errorResult = {
          success: false as const,
          error: errorMessage,
          executionId: '',
          resetInSeconds: typeof data.resetInSeconds === 'number' ? data.resetInSeconds : undefined,
          errorType: getErrorType(response.status, errorMessage),
          metadata: {
            latency: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            costEstimate: 0,
            cached: false,
            model: 'unknown',
          },
        };
        setResult(errorResult);
        // Save failed attempt to history too
        saveToHistory(
          experiment.slug,
          experiment.name,
          input,
          { success: false, error: errorResult.error },
          errorResult.metadata
        );
        return;
      }

      const successResult = {
        success: true as const,
        data: data.data,
        executionId: data.executionId,
        metadata: data.metadata,
      };
      setResult(successResult);
      // Save successful result to history
      saveToHistory(
        experiment.slug,
        experiment.name,
        input,
        { success: true, data: successResult.data },
        successResult.metadata
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('error.failed');
      const errorResult = {
        success: false as const,
        error: errorMessage,
        executionId: '',
        errorType: getErrorType(0, errorMessage),
        metadata: {
          latency: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costEstimate: 0,
          cached: false,
          model: 'unknown',
        },
      };
      setResult(errorResult);
      // Save error to history
      if (lastInput) {
        saveToHistory(
          experiment.slug,
          experiment.name,
          lastInput,
          { success: false, error: errorResult.error },
          errorResult.metadata
        );
      }
    } finally {
      setLoading(false);
    }
  }, [experiment.slug, experiment.name, lastInput, t]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-border">
          <Link
            href="/"
            className="text-xs font-medium text-accent hover:text-accent/80 transition-colors mb-4 inline-flex items-center gap-2 uppercase tracking-wide"
          >
            <span>←</span> {t('backToLab')}
          </Link>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                {tExperiments(`${experiment.slug}.name`)}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                {tExperiments(`${experiment.slug}.description`)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SettingsModal />
              <StateIndicator state={state} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-border overflow-x-auto">
          {(['run', 'api', 'analytics', 'iterations', 'learnings', 'settings'] as const).map(
            tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t(`tabs.${tab}`)}
              </button>
            )
          )}
        </div>

        {/* Run Tab */}
        {activeTab === 'run' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="order-2 xl:order-1">
              <div className="sticky top-8 bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1">{t('configure.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t('configure.subtitle')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FavoritesPanel onLoadFavorite={handleLoadHistory} />
                    <HistoryPanel
                      experimentSlug={experiment.slug}
                      experimentName={experiment.name}
                      onLoadHistory={handleLoadHistory}
                    />
                  </div>
                </div>
                <ExperimentForm
                  key={formKey}
                  experiment={experiment}
                  onSubmit={handleSubmit}
                  loading={loading}
                  initialInput={lastInput || undefined}
                />
              </div>
            </div>

            <div className="order-1 xl:order-2">
              {!result && !loading && (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 border border-border mb-4">
                    <span className="text-3xl text-muted-foreground/70">◇</span>
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    {t('emptyState.title')}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {t('emptyState.subtitle')}
                  </p>
                </div>
              )}

              {loading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-muted border-t-accent shrink-0" />
                    <span className="text-sm">{t('loading.title')}</span>
                  </div>
                  <ResultSkeleton />
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <ResultDisplay
                    result={result}
                    experimentSlug={experiment.slug}
                    experimentName={experiment.name}
                    onRetry={lastInput ? () => handleSubmit(lastInput) : undefined}
                    lastInput={lastInput ?? undefined}
                  />
                  {result.success && result.executionId && (
                    <FeedbackPanel
                      experimentSlug={experiment.slug}
                      executionId={result.executionId}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <ApiTab experimentSlug={experiment.slug} lastInput={lastInput} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard experimentSlug={experiment.slug} />
        )}

        {/* Iterations Tab */}
        {activeTab === 'iterations' && (
          <IterationTimeline experimentSlug={experiment.slug} />
        )}

        {/* Learnings Tab */}
        {activeTab === 'learnings' && (
          <LearningsTab experimentSlug={experiment.slug} />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <FeatureToggleControl experimentSlug={experiment.slug} />
        )}
      </div>

      {/* User Guide */}
      <UserGuide variant="experiment" experimentSlug={experiment.slug} />
    </div>
  );
});

export default ExperimentPage;
