'use client';

import { useEffect, useState } from 'react';

interface ProviderStatus {
  openai: boolean;
  anthropic: boolean;
  groq: boolean;
  google: boolean;
}

interface AIStatus {
  ready: boolean;
  providers?: ProviderStatus;
  configuredCount?: number;
  totalProviders?: number;
  message?: string;
  redis?: boolean;
}

const PROVIDER_LABELS: Record<keyof ProviderStatus, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  groq: 'Groq',
  google: 'Google',
};

export function AIStatusIndicator() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/ai-status');
      const data = await response.json();
      setStatus(data);
    } catch {
      setStatus({ ready: false, message: 'Failed to check AI status' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
        Checking...
      </div>
    );
  }

  const providers = status?.providers;
  const configuredCount = status?.configuredCount ?? 0;
  const totalProviders = status?.totalProviders ?? 4;

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(prev => !prev)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${configuredCount === 0
            ? 'bg-destructive/10 border-destructive/30 text-destructive'
            : configuredCount === totalProviders
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${configuredCount === 0
              ? 'bg-destructive'
              : configuredCount === totalProviders
                ? 'bg-green-400'
                : 'bg-yellow-400'
            }`}
        />
        AI ({configuredCount}/{totalProviders})
      </button>

      {expanded && (
        <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-card border border-border rounded-lg shadow-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground mb-2">AI Providers</p>
          {providers && (Object.keys(PROVIDER_LABELS) as (keyof ProviderStatus)[]).map(key => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{PROVIDER_LABELS[key]}</span>
              <span
                className={`text-xs font-medium flex items-center gap-1 ${providers[key] ? 'text-green-400' : 'text-destructive'
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full inline-block ${providers[key] ? 'bg-green-400' : 'bg-destructive'
                    }`}
                />
                {providers[key] ? 'OK' : 'Not set'}
              </span>
            </div>
          ))}
          {status?.redis != null && (
            <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Cache</span>
              <span className={`text-xs font-medium flex items-center gap-1 ${status.redis ? 'text-green-400' : 'text-muted-foreground'}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${status.redis ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                {status.redis ? 'Redis' : 'In-memory'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
