import { z } from 'zod';

export const lotteryProbabilityInputSchema = z.object({
  gameType: z
    .enum(['power_655', 'power_645', 'power_535', 'custom'])
    .default('power_655'),
  totalNumbers: z
    .number()
    .int()
    .min(1)
    .max(200)
    .describe('Total numbers in the pool (n)')
    .default(55),
  pickNumbers: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe('Numbers picked per ticket (k)')
    .default(6),
  ticketPrice: z
    .number()
    .nonnegative()
    .describe('Ticket price in VND')
    .default(10000),
  jackpotPrize: z
    .number()
    .nonnegative()
    .describe('Jackpot prize in VND (approximate)')
    .default(30000000000),
  draws: z
    .number()
    .int()
    .min(1)
    .max(10000)
    .describe('Number of draws (sessions)')
    .default(52),
  ticketsPerDraw: z
    .number()
    .int()
    .min(1)
    .max(10000)
    .describe('Tickets bought per draw')
    .default(1),
});

export type LotteryProbabilityInput = z.infer<
  typeof lotteryProbabilityInputSchema
>;

export const lotteryProbabilityOutputSchema = z.object({
  gameName: z.string(),
  totalCombinations: z.number(),
  jackpotProbabilityPerTicket: z.number(),
  jackpotOddsOneIn: z.number(),
  expectedValuePerTicket: z.number(),
  expectedPrizePerTicket: z.number(),
  totalTickets: z.number(),
  probabilityAtLeastOneJackpot: z.number(),
  expectedTotalSpend: z.number(),
  expectedTotalWinnings: z.number(),
  // Plain-text explanation & disclaimer (also duplicated in i18n on client)
  explanation: z.string(),
  disclaimer: z.string(),
  // Optional AI-generated narrative & risk notes for educational purposes
  aiNarrative: z.string().optional().nullable(),
  aiRiskNotes: z.string().optional().nullable(),
});

export type LotteryProbabilityOutput = z.infer<
  typeof lotteryProbabilityOutputSchema
>;

