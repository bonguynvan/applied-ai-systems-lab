// Favorites Manager - Save favorite results to localStorage
const FAVORITES_KEY = 'ai-lab-favorites';
const MAX_FAVORITES = 20;

export interface FavoriteItem {
  id: string;
  experimentSlug: string;
  experimentName: string;
  title: string;
  result: {
    success: boolean;
    data?: any;
    error?: string;
  };
  metadata: {
    latency: number;
    costEstimate: number;
    totalTokens: number;
    cached: boolean;
    model: string;
  };
  timestamp: number;
  favoritedAt: number;
}

export function addToFavorites(
  experimentSlug: string,
  experimentName: string,
  title: string,
  result: FavoriteItem['result'],
  metadata: FavoriteItem['metadata']
): FavoriteItem | null {
  if (typeof window === 'undefined') return null;

  try {
    const favorites = getFavorites();

    // Check if already exists (by result data)
    const existingIndex = favorites.findIndex(
      f => f.experimentSlug === experimentSlug &&
           JSON.stringify(f.result) === JSON.stringify(result)
    );

    if (existingIndex !== -1) {
      // Already favorited, update timestamp
      favorites[existingIndex].favoritedAt = Date.now();
      saveFavorites(favorites);
      return favorites[existingIndex];
    }

    const newFavorite: FavoriteItem = {
      id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      experimentSlug,
      experimentName,
      title: title.trim() || 'Untitled',
      result,
      metadata,
      timestamp: Date.now(),
      favoritedAt: Date.now(),
    };

    // Add to beginning, limit to max
    const updatedFavorites = [newFavorite, ...favorites].slice(0, MAX_FAVORITES);
    saveFavorites(updatedFavorites);

    return newFavorite;
  } catch (error) {
    console.error('Failed to add favorite:', error);
    return null;
  }
}

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
}

export function getFavoritesByExperiment(experimentSlug: string): FavoriteItem[] {
  return getFavorites().filter(f => f.experimentSlug === experimentSlug);
}

export function removeFromFavorites(id: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => f.id !== id);

    if (filtered.length === favorites.length) return false;

    saveFavorites(filtered);
    return true;
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    return false;
  }
}

export function updateFavoriteTitle(id: string, title: string): FavoriteItem | null {
  if (typeof window === 'undefined') return null;

  try {
    const favorites = getFavorites();
    const index = favorites.findIndex(f => f.id === id);

    if (index === -1) return null;

    favorites[index].title = title.trim();
    saveFavorites(favorites);
    return favorites[index];
  } catch (error) {
    console.error('Failed to update favorite:', error);
    return null;
  }
}

export function isFavorited(
  experimentSlug: string,
  result: FavoriteItem['result']
): boolean {
  const favorites = getFavorites();
  return favorites.some(
    f => f.experimentSlug === experimentSlug &&
         JSON.stringify(f.result) === JSON.stringify(result)
  );
}

export function clearAllFavorites(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Failed to clear favorites:', error);
  }
}

function saveFavorites(favorites: FavoriteItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}
