import { ExperimentModule } from '@/types/experiments';
import {
  LotteryProbabilityInput,
  LotteryProbabilityOutput,
  lotteryProbabilityInputSchema,
  lotteryProbabilityOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { lotteryHandler } from './handler';

const metadata = {
  name: 'Lottery Probability Lab',
  slug: 'lottery-probability-lab',
  description:
    'Explore lottery odds, expected value, and long-term scenarios using exact probability calculations. Educational only – not gambling advice.',
  costWeight: 0.2,
  promptVersion: 'v1',
};

export const lotteryProbabilityLabExperiment: ExperimentModule<
  LotteryProbabilityInput,
  LotteryProbabilityOutput
> = {
  metadata,
  inputSchema: lotteryProbabilityInputSchema,
  outputSchema: lotteryProbabilityOutputSchema,
  prompt: (input: LotteryProbabilityInput) =>
    getPrompt(input, metadata.promptVersion),
  handler: lotteryHandler,
};

