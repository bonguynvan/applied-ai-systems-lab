import { ExperimentModule } from '@/types/experiments';
import {
    IntentClassifierInput,
    IntentClassifierOutput,
    intentClassifierInputSchema,
    intentClassifierOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { parseIntentClassifierOutput } from './handler';

const metadata = {
    name: 'Smart Intent Classifier',
    slug: 'intent-classifier',
    description:
        'Convert user natural language into structured intents and actionable commands.',
    costWeight: 1,
    promptVersion: 'v1',
};

export const intentClassifierExperiment: ExperimentModule<
    IntentClassifierInput,
    IntentClassifierOutput
> = {
    metadata,
    inputSchema: intentClassifierInputSchema,
    outputSchema: intentClassifierOutputSchema,
    prompt: (input: IntentClassifierInput) =>
        getPrompt(input, metadata.promptVersion),
    handler: parseIntentClassifierOutput,
};
