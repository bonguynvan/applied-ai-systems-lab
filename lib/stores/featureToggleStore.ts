import { FeatureToggle } from '@/types/experimentation';
import { randomUUID } from 'crypto';
import { query } from '../db/neon';

class FeatureToggleStore {
  async createToggle(
    slug: string,
    name: string,
    description: string,
    enabled: boolean = false,
    rolloutPercentage: number = 100,
    variants?: string[]
  ): Promise<FeatureToggle> {
    const id = randomUUID();
    const now = Date.now();

    await query(
      `INSERT INTO feature_toggles (id, experiment_slug, name, description, enabled, rollout_percentage, variants, created_at, modified_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, slug, name, description, enabled, rolloutPercentage, variants, new Date(now), new Date(now)]
    );

    return {
      id,
      experimentSlug: slug,
      name,
      description,
      enabled,
      rolloutPercentage,
      variants,
      createdAt: now,
      modifiedAt: now,
    };
  }

  async getToggles(slug: string): Promise<FeatureToggle[]> {
    const result = await query(
      `SELECT id, experiment_slug as "experimentSlug", name, description, enabled, 
              rollout_percentage as "rolloutPercentage", variants, 
              created_at as "createdAt", modified_at as "modifiedAt" 
       FROM feature_toggles WHERE experiment_slug = $1`,
      [slug]
    );

    return result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt).getTime(),
      modifiedAt: new Date(row.modifiedAt).getTime(),
    }));
  }

  async getToggle(slug: string, name: string): Promise<FeatureToggle | null> {
    const result = await query(
      `SELECT id, experiment_slug as "experimentSlug", name, description, enabled, 
              rollout_percentage as "rolloutPercentage", variants, 
              created_at as "createdAt", modified_at as "modifiedAt" 
       FROM feature_toggles WHERE experiment_slug = $1 AND name = $2`,
      [slug, name]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt).getTime(),
      modifiedAt: new Date(row.modifiedAt).getTime(),
    };
  }

  async isEnabled(slug: string, name: string, userId?: string): Promise<boolean> {
    const toggle = await this.getToggle(slug, name);
    if (!toggle) return false;
    if (!toggle.enabled) return false;

    if (toggle.rolloutPercentage === 100) return true;

    if (userId) {
      const hash = userId
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hash % 100) < toggle.rolloutPercentage;
    }

    return Math.random() * 100 < toggle.rolloutPercentage;
  }

  async updateToggle(
    slug: string,
    name: string,
    updates: Partial<FeatureToggle>
  ): Promise<FeatureToggle | null> {
    const existing = await this.getToggle(slug, name);
    if (!existing) return null;

    const updated = { ...existing, ...updates, modifiedAt: Date.now() };

    await query(
      `UPDATE feature_toggles 
       SET enabled = $1, rollout_percentage = $2, description = $3, variants = $4, modified_at = $5
       WHERE experiment_slug = $6 AND name = $7`,
      [
        updated.enabled,
        updated.rolloutPercentage,
        updated.description,
        updated.variants,
        new Date(updated.modifiedAt),
        slug,
        name
      ]
    );

    return updated;
  }

  async setRolloutPercentage(slug: string, name: string, percentage: number): Promise<FeatureToggle | null> {
    return this.updateToggle(slug, name, { rolloutPercentage: Math.min(100, Math.max(0, percentage)) });
  }

  async setEnabled(slug: string, name: string, enabled: boolean): Promise<FeatureToggle | null> {
    return this.updateToggle(slug, name, { enabled });
  }

  async deleteToggle(slug: string, name: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM feature_toggles WHERE experiment_slug = $1 AND name = $2',
      [slug, name]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const featureToggleStore = new FeatureToggleStore();
