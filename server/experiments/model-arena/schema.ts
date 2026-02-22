import { z } from 'zod';

export const modelArenaInputSchema = z.object({
    promptRequested: z
        .string()
        .min(5, 'Prompt must be at least 5 characters')
        .max(2000, 'Prompt must not exceed 2000 characters'),
    modelsToCompare: z.array(z.string()).min(1).default(['gpt-4o', 'claude-3-5-sonnet-latest']),
});

export type ModelArenaInput = z.infer<typeof modelArenaInputSchema>;

export const modelArenaOutputSchema = z.object({
    responses: z.array(z.object({
        model: z.string(),
        response: z.string(),
        analysis: z.string().optional(),
    })),
    comparisonSummary: z.string(),
    bestFitModel: z.string(),
});

export type ModelArenaOutput = z.infer<typeof modelArenaOutputSchema>;
