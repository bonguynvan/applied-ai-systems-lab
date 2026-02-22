'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { HistoryItem, getHistoryByExperiment, deleteHistoryItem, clearHistoryByExperiment } from '@/lib/history';
import { Button } from '@/components/ui/button';
import { formatDuration, formatCost } from '@/lib/utils/hash';
import { Clock, Trash2, RotateCcw, ChevronDown, ChevronUp, X, Check, AlertCircle } from 'lucide-react';

interface HistoryPanelProps {
  experimentSlug: string;
  experimentName: string;
  onLoadHistory?: (input: Record<string, any>) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function truncateInput(input: Record<string, any>): string {
  // Try to find the main content field
  const contentFields = ['text', 'code', 'description', 'content', 'input'];
  for (const field of contentFields) {
    if (input[field] && typeof input[field] === 'string') {
      const text = input[field];
      return text.length > 80 ? text.slice(0, 80) + '...' : text;
    }
  }
  // Fallback: stringify all
  const str = JSON.stringify(input);
  return str.length > 80 ? str.slice(0, 80) + '...' : str;
}

const HistoryItemCard = memo(function HistoryItemCard({
  item,
  onLoad,
  onDelete,
}: {
  item: HistoryItem;
  onLoad: (input: Record<string, any>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium truncate">
              {truncateInput(item.input)}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(item.timestamp)}
              </span>
              <span className={item.result.success ? 'text-green-500' : 'text-destructive'}>
                {item.result.success ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Success
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Failed
                  </span>
                )}
              </span>
              <span>{formatCost(item.metadata.costEstimate)}</span>
              <span>{item.metadata.totalTokens} tokens</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onLoad(item.input);
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {expanded && item.result.success && item.result.data && (
        <div className="px-4 pb-4 border-t border-border bg-muted/30">
          <div className="pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Result Preview
            </p>
            <pre className="text-xs text-foreground bg-secondary border border-border/50 rounded-lg p-3 max-h-40 overflow-y-auto">
              {JSON.stringify(item.result.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
});

export const HistoryPanel = memo(function HistoryPanel({
  experimentSlug,
  experimentName,
  onLoadHistory,
}: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadHistory = useCallback(() => {
    const items = getHistoryByExperiment(experimentSlug);
    setHistory(items);
  }, [experimentSlug]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDelete = useCallback((id: string) => {
    deleteHistoryItem(id);
    loadHistory();
  }, [loadHistory]);

  const handleClearAll = useCallback(() => {
    if (confirm(`Clear all history for ${experimentName}?`)) {
      clearHistoryByExperiment(experimentSlug);
      loadHistory();
    }
  }, [experimentSlug, experimentName, loadHistory]);

  const handleLoad = useCallback((input: Record<string, any>) => {
    if (onLoadHistory) {
      onLoadHistory(input);
      setIsOpen(false);
    }
  }, [onLoadHistory]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Clock className="w-4 h-4" />
        History ({history.length})
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-background/95 backdrop-blur-xl rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-border/50">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
          <div>
            <h3 className="font-semibold text-foreground">History</h3>
            <p className="text-xs text-muted-foreground">{experimentName}</p>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50 border border-border mb-4">
                <Clock className="w-7 h-7 text-muted-foreground/70" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">No history yet</p>
              <p className="text-sm text-muted-foreground">
                Run an experiment to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <HistoryItemCard
                  key={item.id}
                  item={item}
                  onLoad={handleLoad}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
