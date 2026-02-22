import {
  SQLGeneratorInput,
  SQLGeneratorOutput,
  sqlGeneratorOutputSchema,
} from './schema';

export function parseSQLGeneratorOutput(
  aiResponse: string,
  _input: SQLGeneratorInput
): SQLGeneratorOutput {
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

    // Provide default values for optional fields
    const withDefaults = {
      warnings: [],
      alternatives: [],
      ...parsed,
    };

    const validated = sqlGeneratorOutputSchema.parse(withDefaults);
    return validated;
  } catch (error) {
    console.error('Failed to parse SQL generator output:', error);

    // Attempt to extract SQL from non-JSON response as fallback
    const sqlMatch = aiResponse.match(/(?:SELECT|INSERT|UPDATE|DELETE|WITH|CREATE|ALTER|DROP)[\s\S]+?;/i);
    if (sqlMatch) {
      return {
        sql: sqlMatch[0].trim(),
        explanation: 'Query extracted from response (parsing failed)',
        parameters: [],
        complexity: 'medium',
        warnings: ['Response parsing failed. Please review the query carefully.'],
      };
    }

    throw new Error('Failed to parse AI response. Please try again.');
  }
}
