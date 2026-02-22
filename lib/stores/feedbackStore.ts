import { UserFeedback } from '@/types/experimentation';
import { randomUUID } from 'crypto';
import { query } from '../db/neon';

class FeedbackStore {
  async addFeedback(
    slug: string,
    executionId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    comment?: string
  ): Promise<UserFeedback> {
    const id = randomUUID();
    const createdAt = Date.now();

    await query(
      'INSERT INTO feedback (id, experiment_slug, execution_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, slug, executionId, rating, comment, new Date(createdAt)]
    );

    return {
      id,
      experimentSlug: slug,
      executionId,
      rating,
      comment,
      createdAt,
    };
  }

  async getFeedback(slug: string): Promise<UserFeedback[]> {
    const result = await query(
      'SELECT id, experiment_slug as "experimentSlug", execution_id as "executionId", rating, comment, created_at as "createdAt" FROM feedback WHERE experiment_slug = $1 ORDER BY created_at DESC',
      [slug]
    );

    return result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt).getTime(),
    }));
  }

  async getAverageRating(slug: string): Promise<number> {
    const result = await query(
      'SELECT AVG(rating) as avg FROM feedback WHERE experiment_slug = $1',
      [slug]
    );
    return result.rows[0]?.avg ? parseFloat(result.rows[0].avg) : 0;
  }

  async getRatingDistribution(slug: string): Promise<Record<number, number>> {
    const result = await query(
      'SELECT rating, COUNT(*) as count FROM feedback WHERE experiment_slug = $1 GROUP BY rating',
      [slug]
    );

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.rows.forEach(row => {
      distribution[row.rating] = parseInt(row.count);
    });

    return distribution;
  }

  async getPositiveComments(slug: string): Promise<string[]> {
    const result = await query(
      'SELECT comment FROM feedback WHERE experiment_slug = $1 AND rating >= 4 AND comment IS NOT NULL ORDER BY created_at DESC LIMIT 10',
      [slug]
    );
    return result.rows.map(row => row.comment);
  }

  async getNegativeComments(slug: string): Promise<string[]> {
    const result = await query(
      'SELECT comment FROM feedback WHERE experiment_slug = $1 AND rating <= 2 AND comment IS NOT NULL ORDER BY created_at DESC LIMIT 10',
      [slug]
    );
    return result.rows.map(row => row.comment);
  }
}

export const feedbackStore = new FeedbackStore();
