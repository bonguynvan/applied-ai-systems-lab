'use client';

import { memo, useState, useCallback, FormEvent } from 'react';
import { useFeatureToggles } from '@/lib/hooks/useExperimentData';
import { Button } from '@/components/ui/button';

interface FeatureToggleControlProps {
  experimentSlug: string;
}

// Memoized toggle card
const ToggleCard = memo(function ToggleCard({
  toggle,
  onToggle,
  onRolloutChange,
  onDelete,
}: {
  toggle: {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    rolloutPercentage: number;
  };
  onToggle: (enabled: boolean) => void;
  onRolloutChange: (delta: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{toggle.name}</h4>
          <p className="text-sm text-muted-foreground">{toggle.description}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={toggle.enabled}
            onChange={e => onToggle(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-muted-foreground">{toggle.enabled ? 'On' : 'Off'}</span>
        </label>
      </div>

      {toggle.enabled && (
        <div className="mb-3">
          <label className="text-xs text-muted-foreground font-medium">
            Rollout: {toggle.rolloutPercentage}%
          </label>
          <div className="w-full bg-secondary rounded-full h-2 mt-1">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${toggle.rolloutPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => onRolloutChange(10)}
          variant="outline"
          size="sm"
          disabled={!toggle.enabled}
        >
          +10%
        </Button>
        <Button
          onClick={() => onRolloutChange(-10)}
          variant="outline"
          size="sm"
          disabled={!toggle.enabled}
        >
          -10%
        </Button>
        <Button onClick={onDelete} variant="outline" size="sm" className="ml-auto text-destructive">
          Delete
        </Button>
      </div>
    </div>
  );
});

export const FeatureToggleControl = memo(function FeatureToggleControl({
  experimentSlug,
}: FeatureToggleControlProps) {
  const { toggles, loading, mutate } = useFeatureToggles(experimentSlug);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: false,
    rolloutPercentage: 100,
  });

  const handleCreateToggle = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.description) return;

      try {
        const response = await fetch(`/api/experiments/${experimentSlug}/toggles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setFormData({ name: '', description: '', enabled: false, rolloutPercentage: 100 });
          setShowForm(false);
          mutate();
        }
      } catch (error) {
        console.error('Error creating toggle:', error);
      }
    },
    [experimentSlug, formData, mutate]
  );

  const handleToggleUpdate = useCallback(
    async (name: string, updates: { enabled?: boolean; rolloutPercentage?: number }) => {
      try {
        const response = await fetch(`/api/experiments/${experimentSlug}/toggles/${name}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          mutate();
        }
      } catch (error) {
        console.error('Error updating toggle:', error);
      }
    },
    [experimentSlug, mutate]
  );

  const handleDelete = useCallback(
    async (name: string) => {
      if (!confirm('Delete this toggle?')) return;

      try {
        const response = await fetch(`/api/experiments/${experimentSlug}/toggles/${name}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          mutate();
        }
      } catch (error) {
        console.error('Error deleting toggle:', error);
      }
    },
    [experimentSlug, mutate]
  );

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading toggles...</div>;
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setShowForm(!showForm)} className="w-full">
        {showForm ? 'Cancel' : '+ Create Feature Toggle'}
      </Button>

      {showForm && (
        <form
          onSubmit={handleCreateToggle}
          className="border border-border rounded-lg p-4 bg-secondary space-y-4"
        >
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Toggle Name</label>
            <input
              type="text"
              placeholder="e.g., use_smart_model"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
            <input
              type="text"
              placeholder="What does this toggle control?"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={e => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">Enabled</span>
            </label>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Rollout: {formData.rolloutPercentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.rolloutPercentage}
              onChange={e =>
                setFormData(prev => ({ ...prev, rolloutPercentage: parseInt(e.target.value) }))
              }
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Toggle
          </Button>
        </form>
      )}

      {toggles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No feature toggles yet. Create one to control AI behaviors.
        </div>
      ) : (
        <div className="space-y-3">
          {toggles.map((toggle: { id: string; name: string; description: string; enabled: boolean; rolloutPercentage: number }) => (
            <ToggleCard
              key={toggle.id}
              toggle={toggle}
              onToggle={enabled => handleToggleUpdate(toggle.name, { enabled })}
              onRolloutChange={delta =>
                handleToggleUpdate(toggle.name, {
                  rolloutPercentage: Math.max(0, Math.min(100, toggle.rolloutPercentage + delta)),
                })
              }
              onDelete={() => handleDelete(toggle.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
});
