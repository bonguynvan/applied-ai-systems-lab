import { ExperimentMetrics, DailyMetricsSnapshot } from '@/types/experimentation';
import { feedbackStore } from './feedbackStore';
import { query } from '../db/neon';

class AnalyticsStore {
  async recordExecution(
    slug: string,
    latency: number,
    cost: number,
    tokens: number,
    cached: boolean
  ): Promise<void> {
    await query(
      'INSERT INTO analytics_executions (experiment_slug, latency, cost, tokens, cached) VALUES ($1, $2, $3, $4, $5)',
      [slug, latency, cost, tokens, cached]
    );
  }

  async getMetrics(slug: string): Promise<ExperimentMetrics | null> {
    const executionsResult = await query(
      'SELECT COUNT(*) as count, AVG(latency) as latency, AVG(cost) as cost, AVG(tokens) as tokens, COUNT(*) FILTER (WHERE cached) as cached_count FROM analytics_executions WHERE experiment_slug = $1',
      [slug]
    );

    const stats = executionsResult.rows[0];
    if (!stats || parseInt(stats.count) === 0) return null;

    const totalRequests = parseInt(stats.count);
    const avgLatency = parseFloat(stats.latency);
    const avgCost = parseFloat(stats.cost);
    const avgTokens = parseFloat(stats.tokens);
    const cacheHitRate = parseInt(stats.cached_count) / totalRequests;

    const avgQualityScore = await feedbackStore.getAverageRating(slug);

    return {
      experimentSlug: slug,
      totalRequests,
      avgLatency,
      avgCost,
      avgTokens,
      qualityScore: avgQualityScore,
      cacheHitRate,
      costSavings: (cacheHitRate * avgCost * 100),
      performanceGain: ((avgLatency / 1000) * 100),
      lastUpdated: Date.now(),
    };
  }

  async getDailySnapshots(slug: string, days: number = 30): Promise<DailyMetricsSnapshot[]> {
    const result = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_requests,
        AVG(latency) as avg_latency,
        AVG(cost) as avg_cost,
        COUNT(*) FILTER (WHERE cached)::float / COUNT(*) as cache_hit_rate
      FROM analytics_executions 
      WHERE experiment_slug = $1 AND created_at >= NOW() - ($2 * INTERVAL '1 day')
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [slug, days]
    );

    // Note: avgQualityScore per day would require a more complex join or separate query
    // For now, we'll return the snapshots without granular quality scores per day 
    // or we can fetch them if needed. 

    return result.rows.map(row => ({
      experimentSlug: slug,
      date: row.date.toISOString().split('T')[0],
      totalRequests: parseInt(row.total_requests),
      avgLatency: parseFloat(row.avg_latency),
      avgCost: parseFloat(row.avg_cost),
      avgQualityScore: 0, // Placeholder
      cacheHitRate: parseFloat(row.cache_hit_rate),
    }));
  }

  async getAllMetrics(): Promise<ExperimentMetrics[]> {
    const slugsResult = await query('SELECT DISTINCT experiment_slug FROM analytics_executions');
    const metrics: ExperimentMetrics[] = [];

    for (const row of slugsResult.rows) {
      const m = await this.getMetrics(row.experiment_slug);
      if (m) metrics.push(m);
    }

    return metrics;
  }
}

export const analyticsStore = new AnalyticsStore();
