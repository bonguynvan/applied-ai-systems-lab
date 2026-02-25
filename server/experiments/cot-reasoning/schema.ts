import { z } from 'zod';

export const cotReasoningInputSchema = z.object({
    problem: z
        .string()
        .min(10, 'Problem must be at least 10 characters')
        .max(2000, 'Problem must not exceed 2000 characters'),
    complexity: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type CotReasoningInput = z.infer<typeof cotReasoningInputSchema>;

export const cotReasoningOutputSchema = z.object({
    steps: z.array(z.object({
        stepNumber: z.number(),
        thought: z.string(),
        conclusion: z.string(),
    })),
    finalAnswer: z.string(),
    reflection: z.string().optional().default(''),
    confidence: z.number().min(0).max(1).optional().default(0.8),
});

export type CotReasoningOutput = z.infer<typeof cotReasoningOutputSchema>;
