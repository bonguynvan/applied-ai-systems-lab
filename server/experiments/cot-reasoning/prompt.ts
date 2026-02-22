import { CotReasoningInput } from './schema';

export const COT_REASONING_PROMPT_V1 = (input: CotReasoningInput): string => `
You are a logical reasoning engine. Break down the following problem into logical, sequential steps.

PROBLEM:
"${input.problem}"

For each step, explain your internal "thought" process and then state the "conclusion" for that specific step.
Finally, provide the final answer and a brief "reflection" on the reasoning process.

Output JSON:
{
  "steps": [
    { "stepNumber": 1, "thought": "string", "conclusion": "string" }
  ],
  "finalAnswer": "string",
  "reflection": "string",
  "confidence": number
}

Respond ONLY with valid JSON.
`;

export function getPrompt(input: CotReasoningInput, version: string): string {
    switch (version) {
        case 'v1':
        default:
            return COT_REASONING_PROMPT_V1(input);
    }
}
