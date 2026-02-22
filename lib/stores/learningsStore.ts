import { ExperimentLearning } from '@/types/experimentation';
import { randomUUID } from 'crypto';
import { query } from '../db/neon';

class LearningsStore {
  async addLearning(
    slug: string,
    title: string,
    description: string,
    evidence: string[] = [],
    isPublic: boolean = false
  ): Promise<ExperimentLearning> {
    const id = randomUUID();
    const now = Date.now();

    await query(
      `INSERT INTO learnings (id, experiment_slug, title, description, evidence, is_public, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, slug, title, description, evidence, isPublic, new Date(now), new Date(now)]
    );

    return {
      id,
      experimentSlug: slug,
      title,
      description,
      evidence,
      isPublic,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getLearnings(slug: string): Promise<ExperimentLearning[]> {
    const result = await query(
      `SELECT id, experiment_slug as "experimentSlug", title, description, evidence, 
              is_public as "isPublic", created_at as "createdAt", updated_at as "updatedAt" 
       FROM learnings WHERE experiment_slug = $1 ORDER BY created_at DESC`,
      [slug]
    );

    return result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt).getTime(),
      updatedAt: new Date(row.updatedAt).getTime(),
    }));
  }

  async updateLearning(slug: string, id: string, updates: Partial<ExperimentLearning>): Promise<ExperimentLearning | null> {
    const result = await query(
      'SELECT id, experiment_slug as "experimentSlug", title, description, evidence, is_public as "isPublic", created_at as "createdAt", updated_at as "updatedAt" FROM learnings WHERE id = $1 AND experiment_slug = $2',
      [id, slug]
    );

    if (result.rows.length === 0) return null;

    const existing = result.rows[0];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    await query(
      `UPDATE learnings 
       SET title = $1, description = $2, evidence = $3, is_public = $4, updated_at = $5
       WHERE id = $6 AND experiment_slug = $7`,
      [
        updated.title,
        updated.description,
        updated.evidence,
        updated.isPublic,
        new Date(updated.updatedAt),
        id,
        slug
      ]
    );

    return {
      ...updated,
      createdAt: new Date(updated.createdAt).getTime(),
    };
  }

  async deleteLearning(slug: string, id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM learnings WHERE id = $1 AND experiment_slug = $2',
      [id, slug]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const learningsStore = new LearningsStore();
