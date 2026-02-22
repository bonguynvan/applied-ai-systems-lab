import { ExperimentModule } from '@/types/experiments';
import {
    DataExtractorInput,
    DataExtractorOutput,
    dataExtractorInputSchema,
    dataExtractorOutputSchema,
} from './schema';
import { getPrompt } from './prompt';
import { parseDataExtractorOutput } from './handler';

const metadata = {
    name: 'Structured Data Extractor',
    slug: 'data-extractor',
    description:
        'Extract entities, dates, and topics into strict JSON from unstructured text.',
    costWeight: 1,
    promptVersion: 'v1',
};

export const dataExtractorExperiment: ExperimentModule<
    DataExtractorInput,
    DataExtractorOutput
> = {
    metadata,
    inputSchema: dataExtractorInputSchema,
    outputSchema: dataExtractorOutputSchema,
    prompt: (input: DataExtractorInput) =>
        getPrompt(input, metadata.promptVersion),
    handler: parseDataExtractorOutput,
};
