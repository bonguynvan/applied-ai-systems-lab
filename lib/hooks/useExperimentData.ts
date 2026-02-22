'use client';

import useSWR from 'swr';

// Global fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.json();
};

// Hook for analytics data with deduplication
export function useAnalytics(experimentSlug: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    experimentSlug ? `/api/experiments/${experimentSlug}/analytics?days=30` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  return {
    metrics: data?.metrics ?? null,
    dailySnapshots: data?.dailySnapshots ?? [],
    loading: isLoading,
    error,
    mutate,
  };
}

// Hook for iterations data
export function useIterations(experimentSlug: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ iterations: any[] }>(
    experimentSlug ? `/api/experiments/${experimentSlug}/iterations` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
    }
  );

  return {
    iterations: data?.iterations ?? [],
    loading: isLoading,
    error,
    mutate,
  };
}

// Hook for learnings data
export function useLearnings(experimentSlug: string | null, isPublic = false) {
  const { data, error, isLoading, mutate } = useSWR<{ learnings: any[] }>(
    experimentSlug
      ? `/api/experiments/${experimentSlug}/learnings${isPublic ? '?public=true' : ''}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
    }
  );

  return {
    learnings: data?.learnings ?? [],
    loading: isLoading,
    error,
    mutate,
  };
}

// Hook for feature toggles
export function useFeatureToggles(experimentSlug: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    experimentSlug ? `/api/experiments/${experimentSlug}/toggles` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
    }
  );

  return {
    toggles: data?.toggles ?? [],
    loading: isLoading,
    error,
    mutate,
  };
}

// Preload functions for hover/prefetch
export function prefetchAnalytics(experimentSlug: string) {
  const url = `/api/experiments/${experimentSlug}/analytics?days=30`;
  // Use SWR's preload or just fetch to warm cache
  fetch(url);
}

export function prefetchIterations(experimentSlug: string) {
  fetch(`/api/experiments/${experimentSlug}/iterations`);
}

export function prefetchLearnings(experimentSlug: string) {
  fetch(`/api/experiments/${experimentSlug}/learnings`);
}

export function prefetchToggles(experimentSlug: string) {
  fetch(`/api/experiments/${experimentSlug}/toggles`);
}
