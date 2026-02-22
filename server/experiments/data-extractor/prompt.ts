import { DataExtractorInput } from './schema';

export const DATA_EXTRACTOR_PROMPT_V1 = (input: DataExtractorInput): string => `
You are a highly precise data extraction engine. Your task is to extract structured information from the provided text based on the user's requirements.

TEXT TO ANALYZE:
"""
${input.text}
"""

EXTRACTION REQUIREMENTS:
${input.schemaDescription}

You MUST return the output in the following JSON schema:
{
  "entities": [
    { "name": "string", "type": "string", "context": "optional string" }
  ],
  "dates": [
    { "date": "string (ISO or natural)", "event": "string" }
  ],
  "topics": ["string"],
  "summary": "concise string",
  "confidence": number (0 to 1)
}

Rules:
1. If a field is not found, return an empty array or null where appropriate.
2. Be as specific as possible with entity types (e.g., "Person", "Organization", "Location", "Software").
3. Your response MUST be ONLY valid JSON.
`;

export function getPrompt(input: DataExtractorInput, version: string): string {
    switch (version) {
        case 'v1':
        default:
            return DATA_EXTRACTOR_PROMPT_V1(input);
    }
}
