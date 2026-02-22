import { z } from 'zod';

export const vietnameseTextInputSchema = z.object({
  text: z
    .string()
    .min(10, 'Text must be at least 10 characters')
    .max(5000, 'Text must not exceed 5000 characters'),
});

export type VietnameseTextInput = z.infer<typeof vietnameseTextInputSchema>;

export const vietnameseTextOutputSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  tone: z.enum(['formal', 'casual', 'professional', 'humorous']),
  rewrite: z.string(),
  summary: z.string(),
  keyPhrases: z.array(z.string()),
});

export type VietnameseTextOutput = z.infer<typeof vietnameseTextOutputSchema>;
