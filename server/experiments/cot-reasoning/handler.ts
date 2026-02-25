import {
    CotReasoningInput,
    CotReasoningOutput,
    cotReasoningOutputSchema,
} from './schema';

/** Extract JSON string from markdown code blocks or raw text (first { to last }). */
function extractJsonString(raw: string): string {
    let s = raw.trim();
    const jsonBlock = /^```(?:json)?\s*([\s\S]*?)```\s*$/m;
    const m = s.match(jsonBlock);
    if (m) return m[1].trim();
    const first = s.indexOf('{');
    const last = s.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) return s.slice(first, last + 1);
    return s;
}

export function parseCotReasoningOutput(
    aiResponse: string,
    _input: CotReasoningInput
): CotReasoningOutput {
    const jsonStr = extractJsonString(aiResponse);

    try {
        const parsed = JSON.parse(jsonStr);
        const validated = cotReasoningOutputSchema.parse(parsed);
        return validated;
    } catch (error) {
        const cause = error instanceof Error ? error.message : String(error);
        console.error('Failed to parse CoT Reasoning output:', error);
        throw new Error(`Failed to parse AI response into reasoning data: ${cause}`);
    }
}
