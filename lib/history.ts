// Prompt History Manager - persists to localStorage
const HISTORY_KEY = 'ai-lab-history';
const MAX_HISTORY_ITEMS = 50;

export interface HistoryItem {
  id: string;
  experimentSlug: string;
  experimentName: string;
  input: Record<string, any>;
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
}

export function saveToHistory(
  experimentSlug: string,
  experimentName: string,
  input: Record<string, any>,
  result: HistoryItem['result'],
  metadata: HistoryItem['metadata']
): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      experimentSlug,
      experimentName,
      input,
      result,
      metadata,
      timestamp: Date.now(),
    };

    // Add to beginning, limit to max items
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

export function getHistoryByExperiment(experimentSlug: string): HistoryItem[] {
  return getHistory().filter(item => item.experimentSlug === experimentSlug);
}

export function deleteHistoryItem(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

export function clearHistoryByExperiment(experimentSlug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const updated = history.filter(item => item.experimentSlug !== experimentSlug);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to clear experiment history:', error);
  }
}
