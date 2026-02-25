'use client';

import { memo, useState, useCallback, FormEvent, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExperimentMetadata } from '@/types/experiments';
import { saveDraft, getDraft, clearDraft, getDraftAge, hasDraft } from '@/lib/draft';
import { Clock, RotateCcw, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ModelSelector } from './ModelSelector';
import { CostEstimator } from './CostEstimator';
import { MODEL_CONFIGS } from '@/lib/config/models';
import { getUserSettings, updateUserSettings } from '@/lib/settings';
import { useModelAvailability } from '@/lib/hooks/useModelAvailability';

interface ExperimentFormProps {
  experiment: ExperimentMetadata;
  onSubmit: (input: any) => Promise<void>;
  loading: boolean;
  initialInput?: Record<string, any>;
}

export const ExperimentForm = memo(function ExperimentForm({
  experiment,
  onSubmit,
  loading,
  initialInput,
}: ExperimentFormProps) {
  const [input, setInput] = useState<Record<string, any>>(initialInput || {});
  const [error, setError] = useState<string | null>(null);
  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const [draftAge, setDraftAge] = useState<string | null>(null);
  const [hasUserBYOK, setHasUserBYOK] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations('ExperimentForm');
  const { providers } = useModelAvailability();

  // State for model selection - Initialize from global settings or default
  const [model, setModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getUserSettings().preferredModel || 'gpt-4o';
    }
    return 'gpt-4o';
  });
  // Daily budget limit (approximate, should match server)
  const DAILY_LIMIT = 5.0;
  const PER_REQUEST_LIMIT = 0.2;

  const DEFAULT_ARENA_MODELS = ['gpt-4o', 'claude-3-5-sonnet-latest'];

  // Load draft on mount (if no initialInput provided)
  useEffect(() => {
    if (!initialInput || Object.keys(initialInput).length === 0) {
      const draft = getDraft(experiment.slug);
      if (draft && Object.keys(draft.input).length > 0) {
        setInput(draft.input);
        // Restore model if saved in draft (assuming we start saving it)
        if (draft.input._model && MODEL_CONFIGS[draft.input._model]) {
          setModel(draft.input._model);
        }
        setShowDraftNotice(true);
        setDraftAge(getDraftAge(experiment.slug));
      }
    }
  }, [experiment.slug, initialInput]);

  // Detect if user has provided any personal API key (BYOK)
  useEffect(() => {
    const settings = getUserSettings();
    const hasKey =
      !!settings.openaiKey ||
      !!settings.anthropicKey ||
      !!settings.geminiKey ||
      !!settings.groqKey;
    setHasUserBYOK(hasKey);
  }, []);

  // Update input when initialInput changes (for loading from history/favorites)
  useEffect(() => {
    if (initialInput && Object.keys(initialInput).length > 0) {
      // Separate model from input if present
      const { _model, ...rest } = initialInput;
      setInput(rest);
      if (_model) setModel(_model);
      setError(null);
      setShowDraftNotice(false);
    }
  }, [initialInput]);

  // Auto-save draft on input change
  useEffect(() => {
    if (Object.keys(input).length > 0) {
      saveDraft(experiment.slug, { ...input, _model: model });
    }
  }, [input, model, experiment.slug]);

  // Sync model to global settings on change
  const handleModelChange = useCallback((newModel: string) => {
    setModel(newModel);
    updateUserSettings({ preferredModel: newModel });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (formRef.current && !loading) {
          formRef.current.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loading]);

  const handleChange = useCallback((field: string, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleDismissDraft = useCallback(() => {
    setShowDraftNotice(false);
    clearDraft(experiment.slug);
  }, [experiment.slug]);

  const handleClearDraft = useCallback(() => {
    clearDraft(experiment.slug);
    setInput({});
    setShowDraftNotice(false);
  }, [experiment.slug]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      try {
        // Include model in submission
        await onSubmit({ ...input, model });
        // Clear draft on successful submit
        clearDraft(experiment.slug);
        setShowDraftNotice(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    },
    [input, model, onSubmit, experiment.slug]
  );

  // Estimate current input text for cost calculation
  const currentInputText = JSON.stringify(input);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Draft Notice */}
      {showDraftNotice && (
        <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-foreground">
              {t('draft.restored', { age: draftAge || '' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearDraft}
              className="h-7 text-xs"
            >
              {t('draft.clear')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDismissDraft}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Experiment Instructions */}
      <div className="p-4 bg-muted/50 border border-border rounded-lg mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          {t(`${experiment.slug}.instructions`)}
        </p>
      </div>

      {/* Model Selector */}
      <ModelSelector value={model} onChange={handleModelChange} disabled={loading} />

      {experiment.slug === 'vietnamese-text' && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground mb-2">
            {t('vietnamese-text.textLabel')}
          </label>
          <Textarea
            placeholder={t('vietnamese-text.textPlaceholder')}
            value={input.text || ''}
            onChange={e => handleChange('text', e.target.value)}
            className="font-sans text-sm min-h-[200px] resize-y"
            rows={10}
          />
          <p className="text-xs text-muted-foreground">
            {t('vietnamese-text.textHelp')}
          </p>
        </div>
      )}

      {experiment.slug === 'lottery-probability-lab' && (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('lottery-probability-lab.gameTypeLabel')}
            </label>
            <select
              value={input.gameType || 'power_655'}
              onChange={e => {
                const gameType = e.target.value;
                let totalNumbers = input.totalNumbers ?? 55;
                let pickNumbers = input.pickNumbers ?? 6;

                if (gameType === 'power_655') {
                  totalNumbers = 55;
                  pickNumbers = 6;
                } else if (gameType === 'power_645') {
                  totalNumbers = 45;
                  pickNumbers = 6;
                } else if (gameType === 'power_535') {
                  totalNumbers = 35;
                  pickNumbers = 5;
                }

                handleChange('gameType', gameType);
                handleChange('totalNumbers', totalNumbers);
                handleChange('pickNumbers', pickNumbers);
              }}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
            >
              <option value="power_655">Vietlott Power 6/55</option>
              <option value="power_645">Vietlott Power 6/45</option>
              <option value="power_535">Vietlott Power 5/35</option>
              <option value="custom">{t('lottery-probability-lab.gameTypeCustom')}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('lottery-probability-lab.poolSizeLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={input.totalNumbers ?? 55}
                onChange={e => handleChange('totalNumbers', Number(e.target.value))}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {t('lottery-probability-lab.poolSizeHelp')}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('lottery-probability-lab.pickCountLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={input.pickNumbers ?? 6}
                onChange={e => handleChange('pickNumbers', Number(e.target.value))}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {t('lottery-probability-lab.pickCountHelp')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('lottery-probability-lab.ticketPriceLabel')}
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={input.ticketPrice ?? 10000}
                onChange={e => handleChange('ticketPrice', Number(e.target.value))}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {t('lottery-probability-lab.ticketPriceHelp')}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('lottery-probability-lab.jackpotLabel')}
              </label>
              <input
                type="number"
                min={0}
                step={1000000000}
                value={input.jackpotPrize ?? 30000000000}
                onChange={e => handleChange('jackpotPrize', Number(e.target.value))}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {t('lottery-probability-lab.jackpotHelp')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('lottery-probability-lab.drawsLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={input.draws ?? 52}
                onChange={e => handleChange('draws', Number(e.target.value))}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {t('lottery-probability-lab.drawsHelp')}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('lottery-probability-lab.ticketsPerDrawLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={input.ticketsPerDraw ?? 1}
                onChange={e =>
                  handleChange('ticketsPerDraw', Number(e.target.value))
                }
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {t('lottery-probability-lab.ticketsPerDrawHelp')}
              </p>
            </div>
          </div>
        </>
      )}

      {experiment.slug === 'code-insight' && (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('code-insight.languageLabel')}
            </label>
            <select
              value={input.language || 'typescript'}
              onChange={e => handleChange('language', e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('code-insight.codeLabel')}
            </label>
            <Textarea
              placeholder={t('code-insight.codePlaceholder')}
              value={input.code || ''}
              onChange={e => handleChange('code', e.target.value)}
              className="font-mono text-sm min-h-[300px] resize-y"
              rows={15}
            />
            <p className="text-xs text-muted-foreground">
              {t('code-insight.codeHelp')}
            </p>
          </div>
        </>
      )}

      {experiment.slug === 'sql-generator' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('sql-generator.dialectLabel')}
              </label>
              <select
                value={input.dialect || 'generic'}
                onChange={e => handleChange('dialect', e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
              >
                <option value="generic">{t('sql-generator.options.generic')}</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
                <option value="sqlserver">SQL Server</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('sql-generator.complexityLabel')}
              </label>
              <select
                value={input.complexity || 'medium'}
                onChange={e => handleChange('complexity', e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
              >
                <option value="simple">{t('sql-generator.options.simple')}</option>
                <option value="medium">{t('sql-generator.options.medium')}</option>
                <option value="complex">{t('sql-generator.options.complex')}</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('sql-generator.descriptionLabel')}
            </label>
            <Textarea
              placeholder={t('sql-generator.descriptionPlaceholder')}
              value={input.description || ''}
              onChange={e => handleChange('description', e.target.value)}
              className="font-sans text-sm min-h-[120px] resize-y"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {t('sql-generator.descriptionHelp')}
            </p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('sql-generator.schemaLabel')}
            </label>
            <Textarea
              placeholder={t('sql-generator.schemaPlaceholder')}
              value={input.schema || ''}
              onChange={e => handleChange('schema', e.target.value)}
              className="font-mono text-sm min-h-[150px] resize-y"
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              {t('sql-generator.schemaHelp')}
            </p>
          </div>
        </>
      )}

      {experiment.slug === 'data-extractor' && (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('data-extractor.textLabel')}
            </label>
            <Textarea
              placeholder={t('data-extractor.textPlaceholder')}
              value={input.text || ''}
              onChange={e => handleChange('text', e.target.value)}
              className="font-sans text-sm min-h-[200px] resize-y"
              rows={10}
            />
            <p className="text-xs text-muted-foreground">
              {t('data-extractor.textHelp')}
            </p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('data-extractor.schemaDescriptionLabel')}
            </label>
            <Textarea
              placeholder={t('data-extractor.schemaDescriptionPlaceholder')}
              value={input.schemaDescription || ''}
              onChange={e => handleChange('schemaDescription', e.target.value)}
              className="font-sans text-sm min-h-[80px] resize-y"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {t('data-extractor.schemaDescriptionHelp')}
            </p>
          </div>
        </>
      )}

      {experiment.slug === 'model-arena' && (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('model-arena.promptRequestedLabel')}
            </label>
            <Textarea
              placeholder={t('model-arena.promptRequestedPlaceholder')}
              value={input.promptRequested || ''}
              onChange={e => handleChange('promptRequested', e.target.value)}
              className="font-sans text-sm min-h-[150px] resize-y"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {t('model-arena.promptRequestedHelp')}
            </p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('model-arena.modelsToCompareLabel')}
            </label>
            <div className="space-y-3">
              {Object.entries(
                Object.entries(MODEL_CONFIGS).reduce(
                  (acc, [id, cfg]) => {
                    const provider = cfg.provider;
                    if (!acc[provider]) acc[provider] = [];
                    acc[provider].push(id);
                    return acc;
                  },
                  {} as Record<string, string[]>
                )
              ).map(([provider, models]) => {
                const enabled =
                  providers[provider as keyof typeof providers] ?? true;
                return (
                  <div key={provider}>
                    <div className="px-1 pb-1 text-[11px] font-semibold text-muted-foreground uppercase">
                      {provider}
                      {!enabled && ' (provider not configured)'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {models.map(m => (
                        <label
                          key={m}
                          className="flex items-center gap-2 p-2 rounded border border-border/50 hover:bg-secondary cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            disabled={!enabled}
                            checked={(
                              input.modelsToCompare || DEFAULT_ARENA_MODELS
                            ).includes(m)}
                            onChange={e => {
                              const current =
                                input.modelsToCompare || DEFAULT_ARENA_MODELS;
                              const next = e.target.checked
                                ? Array.from(new Set([...current, m]))
                                : current.filter((x: string) => x !== m);
                              handleChange('modelsToCompare', next);
                            }}
                          />
                          <span className="text-sm font-medium">{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {experiment.slug === 'intent-classifier' && (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('intent-classifier.userInputLabel')}
            </label>
            <Textarea
              placeholder={t('intent-classifier.userInputPlaceholder')}
              value={input.userInput || ''}
              onChange={e => handleChange('userInput', e.target.value)}
              className="font-sans text-sm min-h-[120px] resize-y"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {t('intent-classifier.userInputHelp')}
            </p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('intent-classifier.contextLabel')}
            </label>
            <input
              type="text"
              placeholder="e.g. E-commerce support, Tech desk..."
              value={input.context || ''}
              onChange={e => handleChange('context', e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
            />
          </div>
        </>
      )}

      {experiment.slug === 'robustness-tester' && (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('robustness-tester.basePromptLabel')}
            </label>
            <Textarea
              placeholder={t('robustness-tester.basePromptPlaceholder')}
              value={input.basePrompt || ''}
              onChange={e => handleChange('basePrompt', e.target.value)}
              className="font-sans text-sm min-h-[150px] resize-y"
              rows={6}
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('robustness-tester.perturbationTypeLabel')}
            </label>
            <select
              value={input.perturbationType || 'typos'}
              onChange={e => handleChange('perturbationType', e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
            >
              <option value="typos">{t('robustness-tester.options.typos')}</option>
              <option value="slang">{t('robustness-tester.options.slang')}</option>
              <option value="adversarial">{t('robustness-tester.options.adversarial')}</option>
              <option value="none">{t('robustness-tester.options.none')}</option>
            </select>
          </div>
        </>
      )}

      {experiment.slug === 'cot-reasoning' && (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('cot-reasoning.problemLabel')}
            </label>
            <Textarea
              placeholder={t('cot-reasoning.problemPlaceholder')}
              value={input.problem || ''}
              onChange={e => handleChange('problem', e.target.value)}
              className="font-sans text-sm min-h-[200px] resize-y"
              rows={10}
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('cot-reasoning.complexityLabel')}
            </label>
            <select
              value={input.complexity || 'medium'}
              onChange={e => handleChange('complexity', e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:border-border/80 transition-colors"
            >
              <option value="low">{t('cot-reasoning.options.low')}</option>
              <option value="medium">{t('cot-reasoning.options.medium')}</option>
              <option value="high">{t('cot-reasoning.options.high')}</option>
            </select>
          </div>
        </>
      )}

      {/* Cost Estimator */}
      <div className="space-y-1">
        <CostEstimator
          input={currentInputText}
          model={model}
          limit={DAILY_LIMIT}
        />
        <p className="text-[11px] text-muted-foreground">
          {hasUserBYOK
            ? t('costEstimator.byokNote', {
                perRequest: PER_REQUEST_LIMIT.toFixed(2),
                daily: DAILY_LIMIT.toFixed(2),
              })
            : t('costEstimator.sharedBudgetNote', {
                perRequest: PER_REQUEST_LIMIT.toFixed(2),
                daily: DAILY_LIMIT.toFixed(2),
              })}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex gap-3">
          <span className="flex-shrink-0 text-base">⚠</span>
          <span className="flex-grow">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-semibold text-base transition-all bg-muted text-white hover:bg-muted/80 hover:text-white"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-2">⚙</span>
              {t('buttons.processing')}
            </>
          ) : (
            t('buttons.analyze')
          )}
        </Button>

        {/* Keyboard Shortcut Hint */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono">
              Enter
            </kbd>
            <span>{t('shortcuts.submit')}</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono">
              Esc
            </kbd>
            <span>{t('shortcuts.close')}</span>
          </span>
        </div>
      </div>
    </form>
  );
});
