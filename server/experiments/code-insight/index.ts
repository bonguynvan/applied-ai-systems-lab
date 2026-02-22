import { ExperimentModule } from '@/types/experiments';
import {
  CodeInsightInput,
  CodeInsightOutput,
  codeInsightInputSchema,
  codeInsightOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { parseCodeInsightOutput } from './handler';

const metadata = {
  name: 'Code Insight Engine',
  slug: 'code-insight',
  description:
    'Analyze code for complexity, architecture patterns, refactoring hints, and performance tips',
  costWeight: 1.2,
  promptVersion: 'v1',
};

export const codeInsightExperiment: ExperimentModule<
  CodeInsightInput,
  CodeInsightOutput
> = {
  metadata,
  inputSchema: codeInsightInputSchema as any,
  outputSchema: codeInsightOutputSchema as any,
  prompt: (input: CodeInsightInput) =>
    getPrompt(input, metadata.promptVersion),
  handler: parseCodeInsightOutput,
};
