import {
    DataExtractorInput,
    DataExtractorOutput,
    dataExtractorOutputSchema,
} from './schema';

export function parseDataExtractorOutput(
    aiResponse: string,
    _input: DataExtractorInput
): DataExtractorOutput {
    let jsonStr = aiResponse.trim();

    // Remove markdown code blocks
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
    }

    if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
    }

    try {
        const parsed = JSON.parse(jsonStr.trim());
        const validated = dataExtractorOutputSchema.parse(parsed);
        return validated;
    } catch (error) {
        console.error('Failed to parse Data Extractor output:', error);
        throw new Error('Failed to parse AI response into structured data.');
    }
}
