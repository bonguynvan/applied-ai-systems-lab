'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal, Code } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { getUserSettings } from '@/lib/settings';

// Minimal example body per experiment (no model - we add it when building)
const EXAMPLE_BODIES: Record<string, Record<string, unknown>> = {
  'vietnamese-text': { text: 'Văn bản tiếng Việt mẫu để phân tích sentiment và tone.' },
  'code-insight': { language: 'typescript', code: 'function example() {\n  return 42;\n}' },
  'sql-generator': {
    description: 'Get all users who signed up in the last 30 days',
    dialect: 'generic',
    complexity: 'medium',
  },
  'data-extractor': {
    text: 'John Doe, born 1990-01-15, lives at 123 Main St.',
    schemaDescription: 'Extract name, birth date, and address.',
  },
  'model-arena': { promptRequested: 'Explain recursion in one sentence.' },
  'intent-classifier': { userInput: 'I want to cancel my order' },
  'robustness-tester': { prompt: 'Summarize this article.', variations: 3 },
  'cot-reasoning': { problem: 'What is 15% of 80?' },
};

function getExampleBody(slug: string): Record<string, unknown> {
  const base = EXAMPLE_BODIES[slug] || {};
  return { ...base, model: 'gpt-4o' };
}

interface ApiTabProps {
  experimentSlug: string;
  lastInput: Record<string, unknown> | null;
}

export const ApiTab = memo(function ApiTab({ experimentSlug, lastInput }: ApiTabProps) {
  const t = useTranslations('ApiTab');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedFetch, setCopiedFetch] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/api/experiments/${experimentSlug}`;

  const body = useMemo(() => {
    const raw = lastInput && Object.keys(lastInput).length > 0 ? lastInput : getExampleBody(experimentSlug);
    return JSON.stringify(raw, null, 2);
  }, [lastInput, experimentSlug]);

  const buildHeaders = useCallback(() => {
    const settings = getUserSettings();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (settings.openaiKey) headers['X-OpenAI-Key'] = 'YOUR_OPENAI_KEY';
    if (settings.anthropicKey) headers['X-Anthropic-Key'] = 'YOUR_ANTHROPIC_KEY';
    if (settings.geminiKey) headers['X-Gemini-Key'] = 'YOUR_GEMINI_KEY';
    if (settings.groqKey) headers['X-Groq-Key'] = 'YOUR_GROQ_KEY';
    return headers;
  }, []);

  const curlCommand = useMemo(() => {
    const headers = buildHeaders();
    const headerArgs = Object.entries(headers)
      .map(([k, v]) => `  -H '${k}: ${v}'`)
      .join(' \\\n');
    const bodyOneLine = JSON.stringify(JSON.parse(body));
    const escapedForShell = bodyOneLine.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `curl -X POST '${url}' \\\n${headerArgs} \\\n  -d "${escapedForShell}"`;
  }, [url, body, buildHeaders]);

  const fetchSnippet = useMemo(() => {
    const headers = buildHeaders();
    const headersStr = JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ');
    return `const response = await fetch('${url}', {
  method: 'POST',
  headers: ${headersStr},
  body: JSON.stringify(payload),
});`;
  }, [url, buildHeaders]);

  const copyFetch = useCallback(async () => {
    const fullSnippet = `const payload = ${body};\n\n${fetchSnippet}`;
    try {
      await navigator.clipboard.writeText(fullSnippet);
      setCopiedFetch(true);
      setTimeout(() => setCopiedFetch(false), 2000);
      toast.success(t('copied'));
    } catch {
      toast.error(t('copyFailed'));
    }
  }, [body, fetchSnippet, t]);

  const copyCurl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
      toast.success(t('copied'));
    } catch {
      toast.error(t('copyFailed'));
    }
  }, [curlCommand, t]);


  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t('endpoint')}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm font-mono text-foreground">
            POST {url}
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t('body')}
        </div>
        <pre className="p-4 bg-secondary border border-border rounded-lg text-sm font-mono text-foreground overflow-x-auto whitespace-pre">
          {body}
        </pre>
        {(!lastInput || Object.keys(lastInput).length === 0) && (
          <p className="text-xs text-muted-foreground">{t('bodyHint')}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t('response')}
        </div>
        <p className="text-sm text-muted-foreground">{t('responseDesc')}</p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={copyCurl} className="gap-2">
          {copiedCurl ? <Check className="w-4 h-4 text-green-500" /> : <Terminal className="w-4 h-4" />}
          {t('copyCurl')}
        </Button>
        <Button variant="outline" size="sm" onClick={copyFetch} className="gap-2">
          {copiedFetch ? <Check className="w-4 h-4 text-green-500" /> : <Code className="w-4 h-4" />}
          {t('copyFetch')}
        </Button>
      </div>
    </div>
  );
});
