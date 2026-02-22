import { ExperimentModule } from '@/types/experiments';
import {
    ModelArenaInput,
    ModelArenaOutput,
    modelArenaInputSchema,
    modelArenaOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { parseModelArenaOutput } from './handler';

const metadata = {
    name: 'Model Comparison Arena',
    slug: 'model-arena',
    description:
        'Compare side-by-side responses and analysis from different AI models.',
    costWeight: 1.5,
    promptVersion: 'v1',
};

export const modelArenaExperiment: ExperimentModule<
    ModelArenaInput,
    ModelArenaOutput
> = {
    metadata,
    inputSchema: modelArenaInputSchema,
    outputSchema: modelArenaOutputSchema,
    prompt: (input: ModelArenaInput) =>
        getPrompt(input, metadata.promptVersion),
    handler: parseModelArenaOutput,
};
