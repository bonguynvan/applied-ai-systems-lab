'use client';

import { useEffect, useState } from 'react';
import { getUserSettings } from '@/lib/settings';
import type { ModelProvider } from '@/types/ai';

type ProviderAvailability = Record<ModelProvider, boolean>;

interface ModelAvailabilityState {
  providers: ProviderAvailability;
  loading: boolean;
  error: string | null;
}

const DEFAULT_PROVIDERS: ProviderAvailability = {
  openai: true,
  anthropic: true,
  groq: true,
  google: true,
};

export function useModelAvailability(): ModelAvailabilityState {
  const [state, setState] = useState<ModelAvailabilityState>({
    providers: DEFAULT_PROVIDERS,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/ai-status');
        const data = res.ok ? await res.json() : null;

        const serverProviders = (data?.providers ?? {}) as Partial<ProviderAvailability>;
        const user = typeof window !== 'undefined' ? getUserSettings() : {};

        const combined: ProviderAvailability = {
          openai: !!serverProviders.openai || !!user.openaiKey,
          anthropic: !!serverProviders.anthropic || !!user.anthropicKey,
          groq: !!serverProviders.groq || !!user.groqKey,
          google: !!serverProviders.google || !!user.geminiKey,
        };

        if (!cancelled) {
          setState({
            providers: combined,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load provider status',
          }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

