'use client';

import { memo, useMemo, useCallback } from 'react';
import { useAnalytics } from '@/lib/hooks/useExperimentData';
import { useTranslations } from 'next-intl';
import { BarChart3 } from 'lucide-react';

interface AnalyticsDashboardProps {
  experimentSlug: string;
}

// Memoized metric card to prevent re-renders
const MetricCard = memo(function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: string;
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
        {label}
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
    </div>
  );
});

// Memoized snapshot bar to prevent re-renders
const SnapshotBar = memo(function SnapshotBar({
  snapshot,
  maxRequests,
}: {
  snapshot: { date: string; totalRequests: number };
  maxRequests: number;
}) {
  const width = useMemo(
    () => `${Math.min(100, (snapshot.totalRequests / maxRequests) * 100)}%`,
    [snapshot.totalRequests, maxRequests]
  );

  return (
    <div className="text-sm">
      <div className="flex justify-between mb-1">
        <span className="text-muted-foreground">{snapshot.date}</span>
        <span className="text-foreground font-medium">{snapshot.totalRequests} requests</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width }} />
      </div>
    </div>
  );
});

export const AnalyticsDashboard = memo(function AnalyticsDashboard({
  experimentSlug,
}: AnalyticsDashboardProps) {
  const { metrics, dailySnapshots, loading } = useAnalytics(experimentSlug);
  const t = useTranslations('EmptyStates');

  // Memoize format functions
  const formatNumber = useCallback((num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  }, []);

  const formatCost = useCallback((cost: number) => `$${(cost / 1000).toFixed(4)}`, []);

  // Memoize max requests for bar widths
  const maxRequests = useMemo(() => {
    return metrics?.totalRequests || 1;
  }, [metrics?.totalRequests]);

  // Memoize recent snapshots
  const recentSnapshots = useMemo(() => {
    return dailySnapshots.slice(-7);
  }, [dailySnapshots]);

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading analytics...
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50 border border-border mb-4">
          <BarChart3 className="w-7 h-7 text-muted-foreground/70" />
        </div>
        <p className="text-lg font-medium text-foreground mb-2">{t('analytics.title')}</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {t('analytics.subtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Total Requests" value={metrics.totalRequests.toString()} icon="📊" />
        <MetricCard
          label="Avg Latency"
          value={`${formatNumber(metrics.avgLatency)}ms`}
          icon="⏱"
        />
        <MetricCard label="Avg Cost" value={formatCost(metrics.avgCost)} icon="💰" />
        <MetricCard
          label="Quality Score"
          value={`${formatNumber(metrics.qualityScore, 2)}/5.0`}
          icon="⭐"
        />
        <MetricCard
          label="Cache Hit Rate"
          value={`${formatNumber(metrics.cacheHitRate * 100)}%`}
          icon="💾"
        />
        <MetricCard label="Avg Tokens" value={metrics.avgTokens.toFixed(0)} icon="🔤" />
      </div>

      {/* Daily Trend */}
      {recentSnapshots.length > 0 && (
        <div className="border border-border rounded-lg p-6 bg-card">
          <h3 className="font-bold text-foreground mb-4">7-Day Trend</h3>
          <div className="space-y-4">
            {recentSnapshots.map((snapshot: { date: string; totalRequests: number }) => (
              <SnapshotBar key={snapshot.date} snapshot={snapshot} maxRequests={maxRequests} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
