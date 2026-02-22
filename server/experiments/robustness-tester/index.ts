import { ExperimentModule } from '@/types/experiments';
import {
    RobustnessTesterInput,
    RobustnessTesterOutput,
    robustnessTesterInputSchema,
    robustnessTesterOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { parseRobustnessTesterOutput } from './handler';

const metadata = {
    name: 'Text Perturbation Tester',
    slug: 'robustness-tester',
    description:
        'Test how AI handles noisy inputs, typos, and adversarial prompt variations.',
    costWeight: 1.2,
    promptVersion: 'v1',
};

export const robustnessTesterExperiment: ExperimentModule<
    RobustnessTesterInput,
    RobustnessTesterOutput
> = {
    metadata,
    inputSchema: robustnessTesterInputSchema,
    outputSchema: robustnessTesterOutputSchema,
    prompt: (input: RobustnessTesterInput) =>
        getPrompt(input, metadata.promptVersion),
    handler: parseRobustnessTesterOutput,
};
