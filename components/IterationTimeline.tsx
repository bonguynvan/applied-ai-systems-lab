'use client';

import { memo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GitBranch } from 'lucide-react';
import { useIterations } from '@/lib/hooks/useExperimentData';
interface IterationTimelineProps {
  experimentSlug: string;
}

// Memoized metric badge
const MetricBadge = memo(function MetricBadge({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div
      className={`p-2 rounded-lg text-xs text-center border ${
        positive
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}
    >
      <div className="font-semibold">{value}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
});

// Memoized iteration item
const IterationItem = memo(function IterationItem({
  iteration,
  idx,
  isLast,
  isExpanded,
  onToggle,
}: {
  iteration: {
    id: string;
    version: string;
    createdAt: string;
    reasoning: string;
    promptText: string;
    metrics: {
      latencyChange?: number;
      qualityChange?: number;
      costChange?: number;
    };
  };
  idx: number;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      {!isLast && <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />}

      <button
        onClick={onToggle}
        className="w-full text-left p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors bg-card"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-accent border-2 border-background" />
              <h4 className="font-semibold text-foreground">Version {iteration.version}</h4>
              <span className="text-xs text-muted-foreground">
                {new Date(iteration.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{iteration.reasoning}</p>
          </div>
          <span className="text-muted-foreground">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="ml-12 mt-2 p-4 bg-secondary border border-border rounded-lg space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Prompt</p>
            <pre className="text-xs font-mono text-foreground bg-background p-2 rounded overflow-x-auto max-h-48">
              {iteration.promptText.substring(0, 500)}...
            </pre>
          </div>

          {Object.keys(iteration.metrics).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Impact Metrics
              </p>
              <div className="grid grid-cols-3 gap-2">
                {iteration.metrics.latencyChange !== undefined && (
                  <MetricBadge
                    label="Latency"
                    value={`${iteration.metrics.latencyChange > 0 ? '+' : ''}${iteration.metrics.latencyChange}ms`}
                    positive={iteration.metrics.latencyChange <= 0}
                  />
                )}
                {iteration.metrics.qualityChange !== undefined && (
                  <MetricBadge
                    label="Quality"
                    value={`${iteration.metrics.qualityChange > 0 ? '+' : ''}${iteration.metrics.qualityChange}%`}
                    positive={iteration.metrics.qualityChange > 0}
                  />
                )}
                {iteration.metrics.costChange !== undefined && (
                  <MetricBadge
                    label="Cost"
                    value={`${iteration.metrics.costChange > 0 ? '+' : ''}${iteration.metrics.costChange}%`}
                    positive={iteration.metrics.costChange <= 0}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export const IterationTimeline = memo(function IterationTimeline({
  experimentSlug,
}: IterationTimelineProps) {
  const { iterations, loading } = useIterations(experimentSlug);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const t = useTranslations('EmptyStates');

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading iterations...
      </div>
    );
  }

  if (iterations.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50 border border-border mb-4">
          <GitBranch className="w-7 h-7 text-muted-foreground/70" />
        </div>
        <p className="text-lg font-medium text-foreground mb-2">{t('iterations.title')}</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {t('iterations.subtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {iterations.map((iteration, idx) => (
        <IterationItem
          key={iteration.id}
          iteration={iteration}
          idx={idx}
          isLast={idx === iterations.length - 1}
          isExpanded={expandedId === iteration.id}
          onToggle={() => toggleExpand(iteration.id)}
        />
      ))}
    </div>
  );
});
