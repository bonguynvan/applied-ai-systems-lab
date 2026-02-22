import { SQLGeneratorInput } from './schema';

export const SQL_GENERATOR_PROMPT_V1 = (input: SQLGeneratorInput): string => {
  const dialectInstructions: Record<string, string> = {
    postgresql: 'Use PostgreSQL syntax. Support JSON operators, window functions, CTEs, and advanced features.',
    mysql: 'Use MySQL 8.0+ syntax. Support common table expressions, window functions, and JSON functions.',
    sqlite: 'Use SQLite syntax. Keep it simple, avoid complex window functions. Use standard SQL.',
    sqlserver: 'Use T-SQL syntax. Support SQL Server features like TOP, OFFSET/FETCH, and T-SQL functions.',
    generic: 'Use standard ANSI SQL compatible with most databases. Avoid dialect-specific features.',
  };

  const complexityInstructions: Record<string, string> = {
    simple: 'Generate a simple, straightforward query. Avoid subqueries, CTEs, or complex joins if possible.',
    medium: 'Generate an efficient query using appropriate joins, indexes, and standard SQL features.',
    complex: 'Optimize for performance. Use CTEs, window functions, subqueries, or advanced features as appropriate.',
  };

  const schemaContext = input.schema
    ? `\n\nDATABASE SCHEMA:\n${input.schema}\n\nUse the table and column names from this schema. Ensure your query is compatible with the provided schema.`
    : '';

  return `You are an expert SQL database engineer with deep knowledge of query optimization, database design, and multiple SQL dialects.

TASK: Convert the following natural language description into a well-structured SQL query.

DESCRIPTION:
"${input.description}"

SQL DIALECT: ${input.dialect.toUpperCase()}
${dialectInstructions[input.dialect]}

COMPLEXITY LEVEL: ${input.complexity.toUpperCase()}
${complexityInstructions[input.complexity]}${schemaContext}

Provide your response in the following JSON format:
{
  "sql": "The complete, properly formatted SQL query with indentation",
  "explanation": "Clear explanation of what the query does, including how it works and why certain approaches were chosen (2-4 sentences)",
  "parameters": [
    {
      "name": "parameter_name",
      "type": "data_type",
      "description": "What this parameter represents"
    }
  ],
  "complexity": "simple | medium | complex",
  "warnings": ["Any important caveats, performance concerns, or security considerations"],
  "alternatives": [
    {
      "description": "Brief description of alternative approach",
      "sql": "Alternative SQL query if applicable"
    }
  ]
}

GUIDELINES:
1. Use proper SQL formatting with clear indentation and line breaks
2. Include comments for complex logic using /* */ or -- syntax
3. Add appropriate WHERE clauses to prevent full table scans when possible
4. Use parameterized queries (placeholders like :param_name or $1) instead of string concatenation
5. Consider edge cases like NULL values, empty results, and performance
6. Include LIMIT/OFFSET or TOP for queries that could return many rows
7. Ensure the query is syntactically correct for the specified dialect

Respond ONLY with valid JSON, no markdown formatting or additional text.`;
};

export const SQL_GENERATOR_PROMPT_V2 = (input: SQLGeneratorInput): string => {
  const dialectInstructions: Record<string, string> = {
    postgresql: 'Use PostgreSQL 14+ syntax. Leverage advanced features like LATERAL joins, JSONB operators, and parallel query hints when beneficial.',
    mysql: 'Use MySQL 8.0+ syntax. Leverage window functions, CTEs, and JSON table functions. Consider optimizer hints for complex queries.',
    sqlite: 'Use SQLite 3.35+ syntax. Support window functions and CTEs. Keep queries lightweight and efficient.',
    sqlserver: 'Use T-SQL with SQL Server 2019+ features. Use appropriate indexing hints and consider query store recommendations.',
    generic: 'Write portable ANSI SQL that works across PostgreSQL, MySQL, SQLite, and SQL Server. Test for compatibility.',
  };

  const schemaContext = input.schema
    ? `\n\nDATABASE SCHEMA:\n${input.schema}\n\nStrictly adhere to the provided schema. Use exact table and column names as specified.`
    : '';

  return `You are a senior database architect specializing in query optimization and cross-database compatibility.

TASK: Generate production-ready SQL from natural language description.

INPUT DESCRIPTION:
"${input.description}"

TARGET SQL DIALECT: ${input.dialect.toUpperCase()}
${dialectInstructions[input.dialect]}

COMPLEXITY PREFERENCE: ${input.complexity}${schemaContext}

RESPONSE FORMAT (JSON):
{
  "sql": "Production-ready SQL with optimal formatting and comments",
  "explanation": "Technical explanation of query logic, optimization choices, and performance characteristics",
  "parameters": [
    {
      "name": "param",
      "type": "VARCHAR/INTEGER/DATE/etc",
      "description": "Parameter purpose and expected values"
    }
  ],
  "complexity": "simple | medium | complex",
  "warnings": ["Performance warnings", "Security considerations", "Index recommendations"],
  "alternatives": [
    {
      "description": "When to use this alternative",
      "sql": "Alternative query approach"
    }
  ]
}

BEST PRACTICES:
• Format SQL with 2-space indentation and logical line breaks
• Always use parameterized inputs (never inline user values)
• Add performance hints (indexes to create, EXPLAIN recommendations)
• Handle NULLs explicitly with COALESCE or IS NULL checks
• Consider pagination for result sets
• Use EXPLAIN-friendly constructs
• Include transaction boundaries if modifying data

Return valid JSON only.`;
};

export function getPrompt(input: SQLGeneratorInput, version: string): string {
  switch (version) {
    case 'v2':
      return SQL_GENERATOR_PROMPT_V2(input);
    case 'v1':
    default:
      return SQL_GENERATOR_PROMPT_V1(input);
  }
}
