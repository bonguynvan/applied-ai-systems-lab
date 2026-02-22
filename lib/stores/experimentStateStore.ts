import { ExperimentState, ExperimentLifecycleState } from '@/types/experimentation';
import { query } from '../db/neon';

class ExperimentStateStore {
  async setState(
    slug: string,
    state: ExperimentLifecycleState,
    goals?: string,
    hypothesis?: string
  ): Promise<ExperimentState> {
    const now = Date.now();

    // Check if exists to preserve fields if not provided
    const existing = await this.getState(slug);

    const newState: ExperimentState = {
      experimentSlug: slug,
      state,
      goals: goals ?? existing?.goals,
      hypothesis: hypothesis ?? existing?.hypothesis,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await query(
      `INSERT INTO experiment_states (experiment_slug, state, goals, hypothesis, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (experiment_slug) 
       DO UPDATE SET state = $2, goals = $3, hypothesis = $4, updated_at = $6`,
      [
        newState.experimentSlug,
        newState.state,
        newState.goals,
        newState.hypothesis,
        new Date(newState.createdAt),
        new Date(newState.updatedAt)
      ]
    );

    return newState;
  }

  async getState(slug: string): Promise<ExperimentState | null> {
    const result = await query(
      `SELECT experiment_slug as "experimentSlug", state, goals, hypothesis, 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM experiment_states WHERE experiment_slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      experimentSlug: row.experimentSlug,
      state: row.state as ExperimentLifecycleState,
      goals: row.goals,
      hypothesis: row.hypothesis,
      createdAt: new Date(row.createdAt).getTime(),
      updatedAt: new Date(row.updatedAt).getTime(),
    };
  }

  async getAllStates(): Promise<ExperimentState[]> {
    const result = await query(
      `SELECT experiment_slug as "experimentSlug", state, goals, hypothesis, 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM experiment_states`
    );

    return result.rows.map(row => ({
      experimentSlug: row.experimentSlug,
      state: row.state as ExperimentLifecycleState,
      goals: row.goals,
      hypothesis: row.hypothesis,
      createdAt: new Date(row.createdAt).getTime(),
      updatedAt: new Date(row.updatedAt).getTime(),
    }));
  }

  async transitionState(slug: string, newState: ExperimentLifecycleState): Promise<ExperimentState> {
    const current = await this.getState(slug);
    if (!current) {
      return this.setState(slug, newState);
    }
    return this.setState(slug, newState, current.goals, current.hypothesis);
  }

  async getStateStats(): Promise<{
    byState: Record<ExperimentLifecycleState, number>;
    total: number;
  }> {
    const result = await query(
      'SELECT state, COUNT(*) as count FROM experiment_states GROUP BY state'
    );

    const stats: Record<ExperimentLifecycleState, number> = {
      Idea: 0,
      Building: 0,
      Live: 0,
      Measuring: 0,
      Archived: 0,
    };

    let total = 0;
    result.rows.forEach(row => {
      const count = parseInt(row.count, 10);
      stats[row.state as ExperimentLifecycleState] = count;
      total += count;
    });

    return {
      byState: stats,
      total,
    };
  }
}

export const experimentStateStore = new ExperimentStateStore();
