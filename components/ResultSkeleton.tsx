'use client';

import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ResultSkeleton = memo(function ResultSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Action bar placeholder */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Metadata cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>

      {/* Content block */}
      <div className="border border-border rounded-lg p-6 bg-card space-y-4">
        <Skeleton className="h-5 w-32 rounded" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      </div>
    </div>
  );
});
