import { IntentClassifierInput } from './schema';

export const INTENT_CLASSIFIER_PROMPT_V1 = (input: IntentClassifierInput): string => `
You are a high-performance intent classification engine for an AI Agent.
Context: ${input.context}

USER REQUEST:
"${input.userInput}"

Analyze the request and provide the following:
1. Primary Intent (e.g., "search", "create", "delete", "help", "greet").
2. Priority based on urgency and impact.
3. Entities (key parameters) found in the request (e.g., date, item name, quantity).
4. A suggested executable action string.
5. Reasoning for your classification.

Output JSON:
{
  "intent": "string",
  "subIntent": "string",
  "priority": "low" | "medium" | "high" | "urgent",
  "entities": { "field": "value" },
  "suggestedAction": "string",
  "reasoning": "string"
}

Respond ONLY with valid JSON.
`;

export function getPrompt(input: IntentClassifierInput, version: string): string {
    switch (version) {
        case 'v1':
        default:
            return INTENT_CLASSIFIER_PROMPT_V1(input);
    }
}
