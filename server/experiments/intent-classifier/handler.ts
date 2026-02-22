import {
    IntentClassifierInput,
    IntentClassifierOutput,
    intentClassifierOutputSchema,
} from './schema';

export function parseIntentClassifierOutput(
    aiResponse: string,
    _input: IntentClassifierInput
): IntentClassifierOutput {
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
        const validated = intentClassifierOutputSchema.parse(parsed);
        return validated;
    } catch (error) {
        console.error('Failed to parse Intent Classifier output:', error);
        throw new Error('Failed to parse AI response into intent data.');
    }
}
