import { z } from 'zod';

export const codeInsightInputSchema = z.object({
  code: z
    .string()
    .min(20, 'Code must be at least 20 characters')
    .max(10000, 'Code must not exceed 10000 characters'),
  language: z
    .enum(['javascript', 'typescript', 'python', 'go', 'rust', 'java'])
    .default('typescript'),
});

export type CodeInsightInput = z.infer<typeof codeInsightInputSchema>;

export const codeInsightOutputSchema = z.object({
  complexity: z.enum(['low', 'medium', 'high', 'very_high']),
  architecture: z.string(),
  refactorHints: z.array(z.string()),
  antiPatterns: z.array(z.string()),
  performanceTips: z.array(z.string()),
});

export type CodeInsightOutput = z.infer<typeof codeInsightOutputSchema>;
