import { VietnameseTextInput } from './schema';

export const VIETNAMESE_TEXT_PROMPT_V1 = (input: VietnameseTextInput): string => `
You are an expert Vietnamese language analyst. Analyze the following Vietnamese text and provide structured analysis.

TEXT TO ANALYZE:
"${input.text}"

Provide your analysis in the following JSON format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "tone": "formal" | "casual" | "professional" | "humorous",
  "rewrite": "A rewritten version with improved clarity and flow",
  "summary": "A concise 1-2 sentence summary",
  "keyPhrases": ["key phrase 1", "key phrase 2", ...]
}

Focus on:
1. The emotional sentiment of the text
2. The writing tone and style
3. Improving readability while preserving meaning
4. Summarizing the main message
5. Extracting the most important phrases

Respond ONLY with valid JSON, no additional text.
`;

export const VIETNAMESE_TEXT_PROMPT_V2 = (input: VietnameseTextInput): string => `
You are a Vietnamese language expert specializing in natural language processing and text analysis.

Analyze this Vietnamese text:
"${input.text}"

Return a comprehensive analysis as JSON:
{
  "sentiment": "positive" | "negative" | "neutral",
  "tone": "formal" | "casual" | "professional" | "humorous",
  "rewrite": "Enhanced version focusing on clarity and engagement",
  "summary": "Brief summary (1-2 sentences)",
  "keyPhrases": ["phrase1", "phrase2", "phrase3"]
}

Consider cultural nuances and Vietnamese language conventions.
Respond with ONLY valid JSON.
`;

export function getPrompt(input: VietnameseTextInput, version: string): string {
  switch (version) {
    case 'v2':
      return VIETNAMESE_TEXT_PROMPT_V2(input);
    case 'v1':
    default:
      return VIETNAMESE_TEXT_PROMPT_V1(input);
  }
}
