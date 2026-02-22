import { z } from 'zod';

export const sqlGeneratorInputSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  dialect: z
    .enum(['postgresql', 'mysql', 'sqlite', 'sqlserver', 'generic'])
    .default('generic'),
  schema: z
    .string()
    .max(3000, 'Schema must not exceed 3000 characters')
    .optional(),
  complexity: z
    .enum(['simple', 'medium', 'complex'])
    .default('medium'),
});

export type SQLGeneratorInput = z.infer<typeof sqlGeneratorInputSchema>;

export const sqlGeneratorOutputSchema = z.object({
  sql: z.string(),
  explanation: z.string(),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string(),
  })),
  complexity: z.enum(['simple', 'medium', 'complex']),
  warnings: z.array(z.string()).optional(),
  alternatives: z.array(z.object({
    description: z.string(),
    sql: z.string(),
  })).optional(),
});

export type SQLGeneratorOutput = z.infer<typeof sqlGeneratorOutputSchema>;
