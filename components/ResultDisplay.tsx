'use client';

import { memo, useMemo, useCallback, useState, useEffect } from 'react';
import type { ExecutionResult, ErrorType } from '@/types/experiments';
import { formatDuration, formatCost } from '@/lib/utils/hash';
import { Download, Copy, Check, FileJson, Clock, Share2, Heart, Star, Link2, QrCode, RotateCcw, Timer, DollarSign, FileWarning, Key, Server } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { copyShareLink, generateShareUrl, type ShareableData } from '@/lib/share';
import { addToFavorites, isFavorited, removeFromFavorites } from '@/lib/favorites';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { power655AllTimeFrequency } from '@/lib/lottery/vietlott-history';

interface ResultDisplayProps {
  result: ExecutionResult | null;
  experimentSlug: string;
  experimentName?: string;
  onRetry?: () => void;
  /** When present, included in share link so viewers can "Reproduce" with same input */
  lastInput?: Record<string, any>;
}

interface MetadataCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const MetadataCard = memo(function MetadataCard({
  label,
  value,
  icon,
  highlight,
}: MetadataCardProps) {
  const className = useMemo(
    () =>
      highlight
        ? 'p-4 rounded-lg border transition-all bg-accent/10 border-accent/30'
        : 'p-4 rounded-lg border transition-all bg-secondary border-border hover:border-border/80 hover:bg-secondary/80',
    [highlight]
  );

  return (
    <div className={className}>
      {icon && <div className="mb-2 text-slate-400">{icon}</div>}
      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
        {label}
      </div>
      <div className="text-base md:text-lg font-mono font-semibold text-foreground truncate">
        {value}
      </div>
    </div>
  );
});

interface ResultFieldProps {
  label: string;
  value: string;
}

const ResultField = memo(function ResultField({ label, value }: ResultFieldProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className="px-4 py-2.5 bg-secondary border border-border/50 rounded-lg text-sm font-medium text-foreground inline-block">
        {value}
      </div>
    </div>
  );
});

interface ResultTextFieldProps {
  label: string;
  value: string;
  mono?: boolean;
}

const ResultTextField = memo(function ResultTextField({
  label,
  value,
  mono,
}: ResultTextFieldProps) {
  const className = useMemo(
    () =>
      `text-sm text-foreground bg-secondary border border-border/50 rounded-lg p-3 leading-relaxed ${mono ? 'font-mono text-xs' : ''}`,
    [mono]
  );

  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {label}
      </div>
      <p className={className}>{value}</p>
    </div>
  );
});

interface ResultListProps {
  label: string;
  items: string[];
  icon?: React.ReactNode;
  warning?: boolean;
}

const ResultList = memo(function ResultList({ label, items, icon, warning }: ResultListProps) {
  const itemClassName = useMemo(
    () =>
      warning
        ? 'text-sm text-foreground bg-secondary border rounded-lg p-3 flex gap-3 border-destructive/20'
        : 'text-sm text-foreground bg-secondary border rounded-lg p-3 flex gap-3 border-border/50',
    [warning]
  );

  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {label}
      </div>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className={itemClassName}>
            <span className="flex-shrink-0">{icon || '•'}</span>
            <span className="flex-grow">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

const CodeBlockWithCopy = memo(function CodeBlockWithCopy({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('ResultDisplay');
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('toast.copied'));
    } catch {
      toast.error('Copy failed');
    }
  }, [content, t]);
  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 min-w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10 bg-background/80 hover:bg-background border border-border rounded"
        onClick={handleCopy}
        aria-label={t('actions.copyCode')}
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </Button>
      <pre className={className}>
        <code className="text-sm font-mono text-foreground whitespace-pre block">{content}</code>
      </pre>
    </div>
  );
});

// Export utilities
function exportToJSON(result: ExecutionResult, experimentSlug: string) {
  const data = {
    experiment: experimentSlug,
    timestamp: new Date().toISOString(),
    result: result,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-lab-result-${experimentSlug}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const ResultDisplay = memo(function ResultDisplay({
  result,
  experimentSlug,
  experimentName = 'Experiment',
  onRetry,
  lastInput,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favoriteTitle, setFavoriteTitle] = useState('');
  const [showFavoriteInput, setShowFavoriteInput] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const t = useTranslations('ResultDisplay');

  // Countdown for rate limit retry
  useEffect(() => {
    if (result?.success === false && typeof result.resetInSeconds === 'number' && result.resetInSeconds > 0) {
      setCountdown(result.resetInSeconds);
    } else {
      setCountdown(null);
    }
  }, [result?.success, result?.resetInSeconds]);

  useEffect(() => {
    if (countdown == null || countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => (c != null && c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  // Check if this result is favorited
  useEffect(() => {
    if (result) {
      setIsFav(isFavorited(experimentSlug, result));
    }
  }, [result, experimentSlug]);

  // Close QR when shareUrl changes
  useEffect(() => {
    if (!shareUrl) {
      setShowQR(false);
    }
  }, [shareUrl]);

  const handleExportJSON = useCallback(() => {
    if (result) {
      exportToJSON(result, experimentSlug);
    }
  }, [result, experimentSlug]);

  const handleCopyResult = useCallback(async () => {
    if (result?.data) {
      const text = JSON.stringify(result.data, null, 2);
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(t('toast.copied'));
      }
    }
  }, [result, t]);

  const handleShare = useCallback(() => {
    if (!result) return;

    const shareData: ShareableData = {
      experimentSlug,
      experimentName,
      result: {
        success: result.success,
        data: result.data,
        error: result.error,
      },
      metadata: result.metadata,
      timestamp: Date.now(),
      ...(lastInput && Object.keys(lastInput).length > 0 && { input: lastInput }),
    };

    const url = generateShareUrl(shareData);
    setShareUrl(url);
  }, [result, experimentSlug, experimentName, lastInput]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast.success(t('toast.linkCopied'));
    }
  }, [shareUrl, t]);

  const handleToggleFavorite = useCallback(() => {
    if (!result) return;

    if (isFav) {
      // Remove from favorites (need to find ID)
      const favorites = JSON.parse(localStorage.getItem('ai-lab-favorites') || '[]');
      const fav = favorites.find(
        (f: any) => f.experimentSlug === experimentSlug &&
          JSON.stringify(f.result) === JSON.stringify(result)
      );
      if (fav) {
        removeFromFavorites(fav.id);
        setIsFav(false);
      }
    } else {
      // Show input for title
      setShowFavoriteInput(true);
      setFavoriteTitle(`${experimentName} Result`);
    }
  }, [result, isFav, experimentSlug, experimentName]);

  const handleAddFavorite = useCallback(() => {
    if (!result) return;

    const title = favoriteTitle.trim() || `${experimentName} Result`;
    addToFavorites(
      experimentSlug,
      experimentName,
      title,
      {
        success: result.success,
        data: result.data,
        error: result.error,
      },
      result.metadata
    );
    setIsFav(true);
    setShowFavoriteInput(false);
  }, [result, favoriteTitle, experimentSlug, experimentName]);

  if (!result) return null;

  if (!result.success) {
    const errorType: ErrorType = result.errorType || 'server';
    const iconMap = {
      rate_limit: Timer,
      budget: DollarSign,
      validation: FileWarning,
      api_key: Key,
      server: Server,
    };
    const IconComponent = iconMap[errorType];
    const title = t(`error.${errorType}.title`);
    const suggestion = t(`error.${errorType}.suggestion`);
    const validationItems =
      errorType === 'validation' && result.error
        ? result.error.split(/,\s*/).filter(Boolean)
        : null;

    return (
      <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg space-y-4" role="alert">
        <div className="flex items-start gap-3">
          <div className="text-destructive shrink-0 mt-0.5">
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-destructive mb-1">{title}</h3>
            <p className="text-sm text-destructive/80 leading-relaxed">{result.error}</p>
            {validationItems && validationItems.length > 1 && (
              <ul className="mt-2 list-disc list-inside text-sm text-destructive/80 space-y-0.5">
                {validationItems.map((item, i) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            )}
            <p className="text-sm text-muted-foreground mt-2">{suggestion}</p>
            {countdown != null && countdown > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('error.retryIn', { seconds: countdown })}
              </p>
            )}
          </div>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={countdown != null && countdown > 0}
            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4" />
            {countdown != null && countdown > 0
              ? t('error.retryIn', { seconds: countdown })
              : t('error.retry')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyResult}
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t('actions.copied') : t('actions.copyResult')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJSON}
          className="gap-2"
        >
          <FileJson className="w-4 h-4" />
          {t('actions.exportJson')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          {t('actions.shareLink')}
        </Button>
        {shareUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQR(true)}
            className="gap-2"
          >
            <QrCode className="w-4 h-4" />
            {t('actions.qrCode')}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleFavorite}
          className={`gap-2 ${isFav ? 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10' : ''}`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          {isFav ? t('actions.favorited') : t('actions.favorite')}
        </Button>
      </div>

      {/* Share URL Display */}
      {shareUrl && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <Input
            value={shareUrl}
            readOnly
            className="flex-1 text-sm font-mono"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {linkCopied ? t('actions.copied') : t('actions.copyLink')}
          </Button>
        </div>
      )}

      {/* Favorite Title Input */}
      {showFavoriteInput && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <Star className="w-4 h-4 text-yellow-500" />
          <Input
            value={favoriteTitle}
            onChange={(e) => setFavoriteTitle(e.target.value)}
            placeholder={t('actions.enterTitle')}
            className="flex-1 text-sm"
          />
          <Button
            variant="default"
            size="sm"
            onClick={handleAddFavorite}
            className="gap-2"
          >
            <Heart className="w-4 h-4 fill-current" />
            {t('actions.save')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFavoriteInput(false)}
          >
            {t('actions.cancel')}
          </Button>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && shareUrl && (
        <div className="p-6 bg-muted/50 rounded-lg border border-border text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-accent" />
            <h4 className="font-semibold text-foreground">{t('actions.scanToOpen')}</h4>
          </div>
          <div className="bg-white p-4 rounded-lg inline-block mb-4">
            <QRCodeSVG
              value={shareUrl}
              size={200}
              level="M"
              includeMargin={true}
              imageSettings={{
                src: "/favicon.ico",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
            {t('actions.scanInstruction')}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(false)}
            >
              {t('actions.close')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {linkCopied ? t('actions.copied') : t('actions.copyLink')}
            </Button>
          </div>
        </div>
      )}

      {/* Metadata Panel */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetadataCard
          label={t('metadata.latency')}
          value={formatDuration(result.metadata.latency)}
          icon={<Clock className="w-4 h-4" />}
        />
        <MetadataCard
          label={t('metadata.tokens')}
          value={result.metadata.totalTokens.toString()}
          icon={<span className="text-sm font-mono">T</span>}
        />
        <MetadataCard
          label={t('metadata.cost')}
          value={formatCost(result.metadata.costEstimate)}
          icon={<span className="text-sm font-mono">$</span>}
        />
        <MetadataCard
          label={t('metadata.cache')}
          value={result.metadata.cached ? t('metadata.hit') : t('metadata.miss')}
          icon={result.metadata.cached ? <Check className="w-4 h-4 text-green-500" /> : <span className="text-sm">○</span>}
          highlight={result.metadata.cached}
        />
      </div>

      {/* Results */}
      <div className="border border-border rounded-lg p-6 bg-card">
        <h3 className="font-bold text-lg text-foreground mb-6 pb-4 border-b border-border">
          {t('sections.results')}
        </h3>

        {experimentSlug === 'vietnamese-text' && result.data && (
          <div className="space-y-5">
            <ResultField label={t('fields.sentiment')} value={result.data.sentiment} />
            <ResultField label={t('fields.tone')} value={result.data.tone} />

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {t('sections.keyPhrases')}
              </div>
              <div className="flex flex-wrap gap-2">
                {result.data.keyPhrases?.map((phrase: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-accent/15 text-accent border border-accent/30 rounded-md text-xs font-medium"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>

            <ResultTextField label={t('fields.summary')} value={result.data.summary} />
            <ResultTextField label={t('fields.rewrite')} value={result.data.rewrite} mono />
          </div>
        )}

        {experimentSlug === 'code-insight' && result.data && (
          <div className="space-y-5">
            <ResultField label={t('fields.complexity')} value={result.data.complexity} />
            <ResultTextField label={t('fields.architecture')} value={result.data.architecture} />

            <ResultList
              label={t('fields.refactorHints')}
              items={result.data.refactorHints || []}
              icon={<span className="text-yellow-500">💡</span>}
            />

            <ResultList
              label={t('fields.antiPatterns')}
              items={result.data.antiPatterns || []}
              icon={<span className="text-destructive">⚠</span>}
              warning
            />

            <ResultList
              label={t('fields.performanceTips')}
              items={result.data.performanceTips || []}
              icon={<span className="text-accent">⚡</span>}
            />
          </div>
        )}

        {experimentSlug === 'sql-generator' && result.data && (
          <div className="space-y-5">
            <ResultField label={t('fields.complexity')} value={result.data.complexity} />

            {/* SQL Code Block */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {t('sections.generatedSql')}
              </div>
              <CodeBlockWithCopy
                content={result.data.sql}
                className="bg-secondary border border-border rounded-lg p-4 pr-12 overflow-x-auto"
              />
            </div>

            <ResultTextField label={t('sections.explanation')} value={result.data.explanation} />

            {/* Parameters */}
            {result.data.parameters && result.data.parameters.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t('sections.parameters')}
                </div>
                <div className="grid gap-2">
                  {result.data.parameters.map((param: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-secondary border border-border/50 rounded-lg p-3"
                    >
                      <span className="px-2 py-1 bg-accent/15 text-accent rounded text-xs font-mono font-medium">
                        {param.type}
                      </span>
                      <span className="font-mono text-sm text-foreground">{param.name}</span>
                      <span className="text-sm text-muted-foreground flex-grow">{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.data.warnings && result.data.warnings.length > 0 && (
              <ResultList
                label={t('sections.warnings')}
                items={result.data.warnings}
                icon={<span className="text-destructive">⚠</span>}
                warning
              />
            )}

            {/* Alternative Queries */}
            {result.data.alternatives && result.data.alternatives.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t('sections.alternatives')}
                </div>
                <div className="space-y-3">
                  {result.data.alternatives.map((alt: any, i: number) => (
                    <div key={i} className="bg-secondary border border-border/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">{alt.description}</p>
                      <CodeBlockWithCopy
                        content={alt.sql}
                        className="bg-background border border-border rounded p-3 pr-12 overflow-x-auto text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {experimentSlug === 'lottery-probability-lab' && result.data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetadataCard
                label={t('lottery.gameName')}
                value={result.data.gameName}
              />
              <MetadataCard
                label={t('lottery.totalCombinations')}
                value={result.data.totalCombinations.toLocaleString()}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetadataCard
                label={t('lottery.jackpotOdds')}
                value={
                  result.data.jackpotOddsOneIn > 0
                    ? `1 : ${Math.round(
                        result.data.jackpotOddsOneIn
                      ).toLocaleString()}`
                    : '—'
                }
              />
              <MetadataCard
                label={t('lottery.probabilityAtLeastOne')}
                value={`${(result.data.probabilityAtLeastOneJackpot * 100).toFixed(6)}%`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetadataCard
                label={t('lottery.evPerTicket')}
                value={result.data.expectedValuePerTicket.toFixed(2)}
              />
              <MetadataCard
                label={t('lottery.totalTickets')}
                value={result.data.totalTickets.toLocaleString()}
              />
              <MetadataCard
                label={t('lottery.expectedTotalSpend')}
                value={result.data.expectedTotalSpend.toLocaleString()}
              />
            </div>

            <ResultTextField
              label={t('lottery.explanation')}
              value={result.data.aiNarrative || result.data.explanation}
            />

            {/* Historical frequency chart (Power 6/55) */}
            {result.data.gameName.includes('6/55') && (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('lottery.historyTitle')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('lottery.historySubtitle')}
                  </p>
                </div>
                <ChartContainer
                  config={{
                    count: {
                      label: t('lottery.historySeriesLabel'),
                      color: 'hsl(222.2 84% 56.5%)',
                    },
                  }}
                  className="w-full"
                >
                  <BarChart data={power655AllTimeFrequency}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      fontSize={10}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent nameKey="count" />} />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            )}

            <div className="border border-yellow-500/40 bg-yellow-500/10 rounded-lg p-4">
              <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-2">
                {t('lottery.disclaimerTitle')}
              </div>
              <p className="text-xs md:text-sm text-yellow-700">
                {t('lottery.disclaimerBody')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
