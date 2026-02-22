import {
  VietnameseTextInput,
  VietnameseTextOutput,
  vietnameseTextOutputSchema,
} from './schema';

export function parseVietnameseTextOutput(
  aiResponse: string,
  _input: VietnameseTextInput
): VietnameseTextOutput {
  let jsonStr = aiResponse.trim();

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  }
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }

  try {
    const parsed = JSON.parse(jsonStr.trim());
    const validated = vietnameseTextOutputSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error('Failed to parse Vietnamese text output:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
