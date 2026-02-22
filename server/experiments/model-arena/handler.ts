import {
    ModelArenaInput,
    ModelArenaOutput,
    modelArenaOutputSchema,
} from './schema';

export function parseModelArenaOutput(
    aiResponse: string,
    _input: ModelArenaInput
): ModelArenaOutput {
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
        const validated = modelArenaOutputSchema.parse(parsed);
        return validated;
    } catch (error) {
        console.error('Failed to parse Model Arena output:', error);
        throw new Error('Failed to parse AI response into benchmarking data.');
    }
}
