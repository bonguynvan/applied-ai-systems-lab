'use client';

import { memo, useState, useCallback, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface FeedbackPanelProps {
  experimentSlug: string;
  executionId: string;
  onFeedbackSubmitted?: () => void;
}

export const FeedbackPanel = memo(function FeedbackPanel({
  experimentSlug,
  executionId,
  onFeedbackSubmitted,
}: FeedbackPanelProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations('FeedbackPanel');

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t('selectRating'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/experiments/${experimentSlug}/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            executionId,
            rating,
            comment: comment || undefined,
          }),
        }
      );

      if (response.ok) {
        setSubmitted(true);
        setRating(0);
        setComment('');
        onFeedbackSubmitted?.();
        toast.success(t('thankYou'));
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('submitError'));
    } finally {
      setLoading(false);
    }
  }, [experimentSlug, executionId, rating, comment, onFeedbackSubmitted, t]);

  if (submitted) {
    return (
      <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg text-accent text-sm">
        {t('thankYou')}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">{t('rateLabel')}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(r => (
            <button
              type="button"
              key={r}
              onClick={() => setRating(r)}
              className={`w-10 h-10 rounded-lg border transition-all font-semibold ${rating === r
                  ? 'bg-accent text-background border-accent'
                  : 'border-border hover:border-accent/50 text-muted-foreground'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">
          {t('commentLabel')}
        </label>
        <Textarea
          placeholder={t('commentPlaceholder')}
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          className="text-sm resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full"
      >
        {loading ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
});
