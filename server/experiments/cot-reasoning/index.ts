import { ExperimentModule } from '@/types/experiments';
import {
    CotReasoningInput,
    CotReasoningOutput,
    cotReasoningInputSchema,
    cotReasoningOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { parseCotReasoningOutput } from './handler';

const metadata = {
    name: 'Multi-Step CoT Reasoning',
    slug: 'cot-reasoning',
    description:
        'Visualize the step-by-step logical reasoning process (Chain of Thought) for complex problems.',
    costWeight: 1.3,
    promptVersion: 'v1',
};

export const cotReasoningExperiment: ExperimentModule<
    CotReasoningInput,
    CotReasoningOutput
> = {
    metadata,
    inputSchema: cotReasoningInputSchema,
    outputSchema: cotReasoningOutputSchema,
    prompt: (input: CotReasoningInput) =>
        getPrompt(input, metadata.promptVersion),
    handler: parseCotReasoningOutput,
};
