import { ExperimentModule } from '@/types/experiments';
import {
  VietnameseTextInput,
  VietnameseTextOutput,
  vietnameseTextInputSchema,
  vietnameseTextOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { parseVietnameseTextOutput } from './handler';

const metadata = {
  name: 'Vietnamese Text Analyzer',
  slug: 'vietnamese-text',
  description:
    'Analyze Vietnamese text for sentiment, tone, and generate improved rewrites with summaries',
  costWeight: 1,
  promptVersion: 'v1',
};

export const vietnameseTextExperiment: ExperimentModule<
  VietnameseTextInput,
  VietnameseTextOutput
> = {
  metadata,
  inputSchema: vietnameseTextInputSchema,
  outputSchema: vietnameseTextOutputSchema,
  prompt: (input: VietnameseTextInput) =>
    getPrompt(input, metadata.promptVersion),
  handler: parseVietnameseTextOutput,
};
