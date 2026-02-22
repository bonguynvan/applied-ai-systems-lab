'use client';

import { memo, useState, useCallback, FormEvent } from 'react';
import { useLearnings } from '@/lib/hooks/useExperimentData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { Lightbulb } from 'lucide-react';

interface LearningsTabProps {
  experimentSlug: string;
  isPublic?: boolean;
}

// Memoized learning card
const LearningCard = memo(function LearningCard({
  learning,
}: {
  learning: {
    id: string;
    title: string;
    description: string;
    evidence: string[];
    createdAt: string;
    isPublic: boolean;
  };
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <h3 className="font-bold text-foreground mb-2">{learning.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{learning.description}</p>

      {learning.evidence.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Evidence</p>
          <ul className="text-sm text-foreground space-y-1">
            {learning.evidence.map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{new Date(learning.createdAt).toLocaleDateString()}</span>
        <span>{learning.isPublic ? '🌍 Public' : '🔒 Internal'}</span>
      </div>
    </div>
  );
});

// Memoized evidence item
const EvidenceItem = memo(function EvidenceItem({
  item,
  onRemove,
}: {
  item: string;
  onRemove: () => void;
}) {
  return (
    <div className="p-2 bg-background border border-border rounded text-sm text-foreground flex justify-between">
      <span>{item}</span>
      <button onClick={onRemove} className="text-muted-foreground hover:text-foreground">
        ×
      </button>
    </div>
  );
});

export const LearningsTab = memo(function LearningsTab({
  experimentSlug,
  isPublic = false,
}: LearningsTabProps) {
  const { learnings, loading, mutate } = useLearnings(experimentSlug, isPublic);
  const t = useTranslations('EmptyStates');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    evidence: [] as string[],
  });
  const [evidenceInput, setEvidenceInput] = useState('');

  const handleAddEvidence = useCallback(() => {
    if (evidenceInput.trim()) {
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, evidenceInput.trim()],
      }));
      setEvidenceInput('');
    }
  }, [evidenceInput]);

  const handleRemoveEvidence = useCallback((idx: number) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== idx),
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!formData.title || !formData.description) return;

      try {
        const response = await fetch(`/api/experiments/${experimentSlug}/learnings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            evidence: formData.evidence,
            isPublic,
          }),
        });

        if (response.ok) {
          setFormData({ title: '', description: '', evidence: [] });
          setEvidenceInput('');
          setShowForm(false);
          mutate(); // Refresh data
        }
      } catch (error) {
        console.error('Error creating learning:', error);
      }
    },
    [experimentSlug, formData, isPublic, mutate]
  );

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading learnings...</div>;
  }

  return (
    <div className="space-y-6">
      {!isPublic && (
        <Button onClick={() => setShowForm(!showForm)} className="w-full">
          {showForm ? 'Cancel' : '+ Add Learning'}
        </Button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-lg p-4 bg-secondary space-y-4"
        >
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Title</label>
            <input
              type="text"
              placeholder="What did you learn?"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
            <Textarea
              placeholder="Describe the learning in detail..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Evidence</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add supporting evidence..."
                value={evidenceInput}
                onChange={e => setEvidenceInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
              />
              <Button type="button" onClick={handleAddEvidence} variant="outline">
                Add
              </Button>
            </div>
            {formData.evidence.length > 0 && (
              <div className="space-y-2">
                {formData.evidence.map((item, idx) => (
                  <EvidenceItem
                    key={idx}
                    item={item}
                    onRemove={() => handleRemoveEvidence(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save Learning
          </Button>
        </form>
      )}

      {learnings.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50 border border-border mb-4">
            <Lightbulb className="w-7 h-7 text-muted-foreground/70" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            {isPublic ? t('learningsPublic.title') : t('learnings.title')}
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isPublic ? t('learningsPublic.subtitle') : t('learnings.subtitle')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {learnings.map(learning => (
            <LearningCard key={learning.id} learning={learning} />
          ))}
        </div>
      )}
    </div>
  );
});
