import { PromptIteration } from '@/types/experimentation';
import { randomUUID } from 'crypto';
import { query } from '../db/neon';

class PromptIterationStore {
  async createIteration(
    slug: string,
    promptText: string,
    reasoning: string,
    metrics?: {
      previousVersion?: number;
      latencyChange?: number;
      qualityChange?: number;
      costChange?: number;
    }
  ): Promise<PromptIteration> {
    const iterations = await this.getIterations(slug);
    const version = iterations.length + 1;
    const id = randomUUID();
    const createdAt = Date.now();

    await query(
      `INSERT INTO prompt_iterations (id, experiment_slug, version, prompt_text, reasoning, latency_change, quality_change, cost_change, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        slug,
        version,
        promptText,
        reasoning,
        metrics?.latencyChange,
        metrics?.qualityChange,
        metrics?.costChange,
        new Date(createdAt)
      ]
    );

    return {
      id,
      experimentSlug: slug,
      version,
      promptText,
      reasoning,
      metrics: metrics || {},
      createdAt,
    };
  }

  async getIterations(slug: string): Promise<PromptIteration[]> {
    const result = await query(
      `SELECT id, experiment_slug as "experimentSlug", version, prompt_text as "promptText", 
              reasoning, latency_change as "latencyChange", quality_change as "qualityChange", 
              cost_change as "costChange", created_at as "createdAt" 
       FROM prompt_iterations WHERE experiment_slug = $1 ORDER BY version ASC`,
      [slug]
    );

    return result.rows.map(row => ({
      id: row.id,
      experimentSlug: row.experimentSlug,
      version: row.version,
      promptText: row.promptText,
      reasoning: row.reasoning,
      metrics: {
        latencyChange: row.latencyChange,
        qualityChange: row.qualityChange,
        costChange: row.costChange,
      },
      createdAt: new Date(row.createdAt).getTime(),
    }));
  }

  async getCurrentVersion(slug: string): Promise<PromptIteration | null> {
    const iterations = await this.getIterations(slug);
    return iterations.length > 0 ? iterations[iterations.length - 1] : null;
  }
}

export const promptIterationStore = new PromptIterationStore();
