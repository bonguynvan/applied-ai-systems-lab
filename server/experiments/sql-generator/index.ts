import { ExperimentModule } from '@/types/experiments';
import {
  SQLGeneratorInput,
  SQLGeneratorOutput,
  sqlGeneratorInputSchema,
  sqlGeneratorOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { parseSQLGeneratorOutput } from './handler';

const metadata = {
  name: 'SQL Generator',
  slug: 'sql-generator',
  description:
    'Convert natural language descriptions into production-ready SQL queries with explanations, parameters, and optimization tips',
  costWeight: 1.1,
  promptVersion: 'v1',
};

export const sqlGeneratorExperiment: ExperimentModule<
  SQLGeneratorInput,
  SQLGeneratorOutput
> = {
  metadata,
  inputSchema: sqlGeneratorInputSchema as any,
  outputSchema: sqlGeneratorOutputSchema as any,
  prompt: (input: SQLGeneratorInput) =>
    getPrompt(input, metadata.promptVersion),
  handler: parseSQLGeneratorOutput,
};
