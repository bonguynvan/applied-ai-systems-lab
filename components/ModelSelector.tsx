'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MODEL_CONFIGS } from '@/lib/config/models';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModelAvailability } from '@/lib/hooks/useModelAvailability';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const t = useTranslations('ExperimentForm.modelSelector');
  const { providers } = useModelAvailability();

  // Group models by provider
  const modelsByProvider = useMemo(
    () =>
      Object.entries(MODEL_CONFIGS).reduce(
        (acc, [id, config]) => {
          const provider = config.provider;
          if (!acc[provider]) acc[provider] = [];
          acc[provider].push({ id, ...config });
          return acc;
        },
        {} as Record<string, (typeof MODEL_CONFIGS[string] & { id: string })[]>
      ),
    []
  );

  // Ensure currently selected model belongs to an enabled provider.
  useEffect(() => {
    const current = MODEL_CONFIGS[value];
    if (current && providers[current.provider]) {
      return;
    }

    const fallback = Object.entries(MODEL_CONFIGS).find(
      ([, cfg]) => providers[cfg.provider]
    );

    if (fallback) {
      onChange(fallback[0]);
    }
  }, [value, providers, onChange]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {t('label')}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(modelsByProvider).map(([provider, providerModels]) => {
            const enabled =
              providers[provider as keyof typeof providers] ?? true;
            return (
              <div key={provider}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  {provider}
                  {!enabled && ' (provider not configured)'}
                </div>
                {providerModels.map(model => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    disabled={!enabled}
                  >
                    {model.id}
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {t('help')}
      </p>
    </div>
  );
}
