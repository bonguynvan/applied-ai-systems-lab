export type ExperimentLifecycleState = 'Idea' | 'Building' | 'Live' | 'Measuring' | 'Archived';

export interface ExperimentState {
  experimentSlug: string;
  state: ExperimentLifecycleState;
  goals?: string;
  hypothesis?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PromptIteration {
  id: string;
  experimentSlug: string;
  version: number;
  promptText: string;
  reasoning: string;
  metrics: {
    previousVersion?: number;
    latencyChange?: number;
    qualityChange?: number;
    costChange?: number;
  };
  createdAt: number;
}

export interface UserFeedback {
  id: string;
  experimentSlug: string;
  executionId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: number;
}

export interface ExperimentMetrics {
  experimentSlug: string;
  totalRequests: number;
  avgLatency: number;
  avgCost: number;
  avgTokens: number;
  qualityScore: number;
  cacheHitRate: number;
  costSavings: number;
  performanceGain: number;
  lastUpdated: number;
}

export interface FeatureToggle {
  id: string;
  experimentSlug: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  variants?: string[];
  createdAt: number;
  modifiedAt: number;
}

export interface ModelComparison {
  executionId: string;
  fastModel: {
    model: string;
    latency: number;
    cost: number;
    tokens: number;
    response: string;
  };
  smartModel: {
    model: string;
    latency: number;
    cost: number;
    tokens: number;
    response: string;
  };
  qualityDelta: number;
}

export interface ExperimentLearning {
  id: string;
  experimentSlug: string;
  title: string;
  description: string;
  evidence: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DailyMetricsSnapshot {
  experimentSlug: string;
  date: string;
  totalRequests: number;
  avgLatency: number;
  avgCost: number;
  avgQualityScore: number;
  cacheHitRate: number;
}
