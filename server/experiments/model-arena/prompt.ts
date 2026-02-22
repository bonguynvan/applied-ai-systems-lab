import { ModelArenaInput } from './schema';

export const MODEL_ARENA_PROMPT_V1 = (input: ModelArenaInput): string => `
You are an AI benchmarking expert. I will provide a prompt and you need to simulate how different models would respond AND provide a comparison.

PROMPT TO COMPARE:
"""
${input.promptRequested}
"""

MODELS TO CONSIDER:
${input.modelsToCompare.join(', ')}

Please provide:
1. A realistic response for EACH model.
2. An analysis of the differences (latency, cost-efficiency, style, accuracy).
3. A recommendation on which model is "best fit" for this specific prompt.

Output JSON:
{
  "responses": [
    { "model": "string", "response": "string", "analysis": "string" }
  ],
  "comparisonSummary": "string comparing all responses",
  "bestFitModel": "model name"
}

Respond ONLY with valid JSON.
`;

export function getPrompt(input: ModelArenaInput, version: string): string {
    switch (version) {
        case 'v1':
        default:
            return MODEL_ARENA_PROMPT_V1(input);
    }
}
