'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { FavoriteItem, getFavorites, removeFromFavorites, updateFavoriteTitle } from '@/lib/favorites';
import { Button } from '@/components/ui/button';
import { formatDuration, formatCost } from '@/lib/utils/hash';
import { Star, Trash2, X, ChevronDown, ChevronUp, Edit2, Check, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FavoritesPanelProps {
  onLoadFavorite?: (input: Record<string, any>) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const FavoriteCard = memo(function FavoriteCard({
  item,
  onLoad,
  onDelete,
  onUpdateTitle,
}: {
  item: FavoriteItem;
  onLoad: (input: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  const handleSaveTitle = useCallback(() => {
    onUpdateTitle(item.id, editTitle);
    setIsEditing(false);
  }, [item.id, editTitle, onUpdateTitle]);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-sm"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSaveTitle}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{item.experimentName}</span>
              <span>•</span>
              <span>{formatDate(item.favoritedAt)}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDuration(item.metadata.latency)}
              </span>
              <span className="text-muted-foreground">{formatCost(item.metadata.costEstimate)}</span>
              <span className="text-muted-foreground">{item.metadata.totalTokens} tokens</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLoad(item.result.data || {})}
            >
              Load
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {expanded && item.result.data && (
        <div className="px-4 pb-4 border-t border-border bg-muted/30">
          <div className="pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Result Data
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

export const FavoritesPanel = memo(function FavoritesPanel({
  onLoadFavorite,
}: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadFavorites = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen, loadFavorites]);

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
    removeFromFavorites(id);
    loadFavorites();
  }, [loadFavorites]);

  const handleUpdateTitle = useCallback((id: string, title: string) => {
    updateFavoriteTitle(id, title);
    loadFavorites();
  }, [loadFavorites]);

  const handleLoad = useCallback((input: Record<string, any>) => {
    if (onLoadFavorite) {
      onLoadFavorite(input);
      setIsOpen(false);
    }
  }, [onLoadFavorite]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Star className="w-4 h-4" />
        Favorites ({favorites.length})
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Favorites</h3>
              <p className="text-xs text-muted-foreground">
                Your saved results
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {favorites.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50 border border-border mb-4">
                <Star className="w-7 h-7 text-yellow-500/70" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">No favorites yet</p>
              <p className="text-sm text-muted-foreground">
                Click the heart icon on any result to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((item) => (
                <FavoriteCard
                  key={item.id}
                  item={item}
                  onLoad={handleLoad}
                  onDelete={handleDelete}
                  onUpdateTitle={handleUpdateTitle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
