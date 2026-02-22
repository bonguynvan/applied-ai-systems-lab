import { CodeInsightInput } from './schema';

export const CODE_INSIGHT_PROMPT_V1 = (input: CodeInsightInput): string => `
You are an expert software architect and code reviewer. Analyze the following ${input.language} code:

\`\`\`${input.language}
${input.code}
\`\`\`

Provide comprehensive analysis as JSON:
{
  "complexity": "low" | "medium" | "high" | "very_high",
  "architecture": "Description of the code's architecture and design patterns",
  "refactorHints": ["hint 1", "hint 2", "hint 3"],
  "antiPatterns": ["antipattern 1", "antipattern 2"],
  "performanceTips": ["tip 1", "tip 2"]
}

Focus on:
1. Cyclomatic complexity and cognitive load
2. Design patterns used or missing
3. Specific refactoring suggestions
4. Common anti-patterns present
5. Performance and optimization opportunities

Respond ONLY with valid JSON.
`;

export const CODE_INSIGHT_PROMPT_V2 = (input: CodeInsightInput): string => `
You are a senior software engineer specializing in code quality and architecture reviews.

Analyze this ${input.language} code and provide detailed insights:

\`\`\`${input.language}
${input.code}
\`\`\`

Return JSON analysis:
{
  "complexity": "low" | "medium" | "high" | "very_high",
  "architecture": "Architecture assessment and design pattern analysis",
  "refactorHints": ["actionable refactoring suggestion 1", "suggestion 2", "suggestion 3"],
  "antiPatterns": ["identified anti-pattern 1", "anti-pattern 2"],
  "performanceTips": ["optimization tip 1", "tip 2"]
}

Be specific, actionable, and consider industry best practices.
Response: valid JSON only.
`;

export function getPrompt(input: CodeInsightInput, version: string): string {
  switch (version) {
    case 'v2':
      return CODE_INSIGHT_PROMPT_V2(input);
    case 'v1':
    default:
      return CODE_INSIGHT_PROMPT_V1(input);
  }
}
