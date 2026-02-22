import { z } from 'zod';

export const dataExtractorInputSchema = z.object({
    text: z
        .string()
        .min(10, 'Text must be at least 10 characters')
        .max(10000, 'Text must not exceed 10000 characters'),
    schemaDescription: z
        .string()
        .min(5, 'Description must be at least 5 characters')
        .default('Extract key entities, dates, and main topics'),
});

export type DataExtractorInput = z.infer<typeof dataExtractorInputSchema>;

export const dataExtractorOutputSchema = z.object({
    entities: z.array(z.object({
        name: z.string(),
        type: z.string(),
        context: z.string().optional(),
    })),
    dates: z.array(z.object({
        date: z.string(),
        event: z.string(),
    })),
    topics: z.array(z.string()),
    summary: z.string(),
    confidence: z.number().min(0).max(1),
});

export type DataExtractorOutput = z.infer<typeof dataExtractorOutputSchema>;
