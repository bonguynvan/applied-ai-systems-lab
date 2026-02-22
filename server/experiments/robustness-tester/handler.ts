import {
    RobustnessTesterInput,
    RobustnessTesterOutput,
    robustnessTesterOutputSchema,
} from './schema';

export function parseRobustnessTesterOutput(
    aiResponse: string,
    _input: RobustnessTesterInput
): RobustnessTesterOutput {
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
        const validated = robustnessTesterOutputSchema.parse(parsed);
        return validated;
    } catch (error) {
        console.error('Failed to parse Robustness Tester output:', error);
        throw new Error('Failed to parse AI response into robustness data.');
    }
}
