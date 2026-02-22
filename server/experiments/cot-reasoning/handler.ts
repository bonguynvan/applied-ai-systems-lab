import {
    CotReasoningInput,
    CotReasoningOutput,
    cotReasoningOutputSchema,
} from './schema';

export function parseCotReasoningOutput(
    aiResponse: string,
    _input: CotReasoningInput
): CotReasoningOutput {
    let jsonStr = aiResponse.trim();

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
        const validated = cotReasoningOutputSchema.parse(parsed);
        return validated;
    } catch (error) {
        console.error('Failed to parse CoT Reasoning output:', error);
        throw new Error('Failed to parse AI response into reasoning data.');
    }
}
