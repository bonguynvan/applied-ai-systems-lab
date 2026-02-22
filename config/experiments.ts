import { vietnameseTextExperiment } from '@/server/experiments/vietnamese-text';
import { codeInsightExperiment } from '@/server/experiments/code-insight';
import { sqlGeneratorExperiment } from '@/server/experiments/sql-generator';
import { dataExtractorExperiment } from '@/server/experiments/data-extractor';
import { modelArenaExperiment } from '@/server/experiments/model-arena';
import { intentClassifierExperiment } from '@/server/experiments/intent-classifier';
import { robustnessTesterExperiment } from '@/server/experiments/robustness-tester';
import { cotReasoningExperiment } from '@/server/experiments/cot-reasoning';
import { ExperimentModule } from '@/types/experiments';

export const EXPERIMENTS_REGISTRY: Record<string, ExperimentModule> = {
  [vietnameseTextExperiment.metadata.slug]: vietnameseTextExperiment,
  [codeInsightExperiment.metadata.slug]: codeInsightExperiment,
  [sqlGeneratorExperiment.metadata.slug]: sqlGeneratorExperiment,
  [dataExtractorExperiment.metadata.slug]: dataExtractorExperiment,
  [modelArenaExperiment.metadata.slug]: modelArenaExperiment,
  [intentClassifierExperiment.metadata.slug]: intentClassifierExperiment,
  [robustnessTesterExperiment.metadata.slug]: robustnessTesterExperiment,
  [cotReasoningExperiment.metadata.slug]: cotReasoningExperiment,
};

export function getExperimentBySlug(slug: string): ExperimentModule | null {
  return EXPERIMENTS_REGISTRY[slug] || null;
}

export function getAllExperiments(): ExperimentModule[] {
  return Object.values(EXPERIMENTS_REGISTRY);
}

export function getExperimentMetadata() {
  return getAllExperiments().map(exp => ({
    ...exp.metadata,
  }));
}
