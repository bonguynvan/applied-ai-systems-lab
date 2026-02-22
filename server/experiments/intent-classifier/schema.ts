import { z } from 'zod';

export const intentClassifierInputSchema = z.object({
    userInput: z
        .string()
        .min(2, 'Input must be at least 2 characters')
        .max(500, 'Input must not exceed 500 characters'),
    context: z.string().default('General Assistant'),
});

export type IntentClassifierInput = z.infer<typeof intentClassifierInputSchema>;

export const intentClassifierOutputSchema = z.object({
    intent: z.string(),
    subIntent: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    entities: z.record(z.string(), z.any()),
    suggestedAction: z.string(),
    reasoning: z.string(),
});

export type IntentClassifierOutput = z.infer<typeof intentClassifierOutputSchema>;
