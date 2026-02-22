// Auto-save Draft Manager - Saves form input to localStorage
const DRAFT_KEY_PREFIX = 'ai-lab-draft-';
const SAVE_DEBOUNCE_MS = 1000; // Save 1 second after last change

export interface DraftData {
  input: Record<string, any>;
  savedAt: number;
}

// Debounce timer
let saveTimer: NodeJS.Timeout | null = null;

export function saveDraft(experimentSlug: string, input: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  // Clear existing timer
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  // Debounce save
  saveTimer = setTimeout(() => {
    try {
      const draft: DraftData = {
        input,
        savedAt: Date.now(),
      };
      localStorage.setItem(`${DRAFT_KEY_PREFIX}${experimentSlug}`, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, SAVE_DEBOUNCE_MS);
}

export function getDraft(experimentSlug: string): DraftData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(`${DRAFT_KEY_PREFIX}${experimentSlug}`);
    if (!stored) return null;

    const draft: DraftData = JSON.parse(stored);

    // Check if draft is older than 7 days (optional cleanup)
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - draft.savedAt > oneWeek) {
      clearDraft(experimentSlug);
      return null;
    }

    return draft;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export function clearDraft(experimentSlug: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(`${DRAFT_KEY_PREFIX}${experimentSlug}`);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

export function hasDraft(experimentSlug: string): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(`${DRAFT_KEY_PREFIX}${experimentSlug}`);
}

export function getDraftAge(experimentSlug: string): string | null {
  const draft = getDraft(experimentSlug);
  if (!draft) return null;

  const diffMs = Date.now() - draft.savedAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
