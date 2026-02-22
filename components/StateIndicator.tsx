'use client';

import { memo } from 'react';
import { ExperimentLifecycleState } from '@/types/experimentation';

interface StateIndicatorProps {
  state: ExperimentLifecycleState;
}

const stateConfig: Record<ExperimentLifecycleState, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  Idea: {
    label: 'Idea',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
  },
  Building: {
    label: 'Building',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
  },
  Live: {
    label: 'Live',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30',
  },
  Measuring: {
    label: 'Measuring',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
  },
  Archived: {
    label: 'Archived',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
};

export const StateIndicator = memo(function StateIndicator({ state }: StateIndicatorProps) {
  const config = stateConfig[state];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${config.bgColor} ${config.color} ${config.borderColor}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      {config.label}
    </div>
  );
});
