import { z } from 'zod';

export const robustnessTesterInputSchema = z.object({
    basePrompt: z
        .string()
        .min(5, 'Prompt must be at least 5 characters')
        .max(1000, 'Prompt must not exceed 1000 characters'),
    perturbationType: z.enum(['typos', 'slang', 'adversarial', 'none']).default('typos'),
});

export type RobustnessTesterInput = z.infer<typeof robustnessTesterInputSchema>;

export const robustnessTesterOutputSchema = z.object({
    perturbedPrompt: z.string(),
    originalResponse: z.string(),
    perturbedResponse: z.string(),
    robustnessScore: z.number().min(0).max(100),
    analysis: z.string(),
    impactOnAccuracy: z.enum(['none', 'minor', 'significant', 'catastrophic']),
});

export type RobustnessTesterOutput = z.infer<typeof robustnessTesterOutputSchema>;
