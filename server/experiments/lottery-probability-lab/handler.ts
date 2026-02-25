import {
  LotteryProbabilityInput,
  LotteryProbabilityOutput,
} from './schema';

function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  const m = Math.min(k, n - k);
  for (let i = 1; i <= m; i++) {
    result = (result * (n - m + i)) / i;
  }
  return result;
}

function getGameName(input: LotteryProbabilityInput): string {
  switch (input.gameType) {
    case 'power_655':
      return 'Vietlott Power 6/55';
    case 'power_645':
      return 'Vietlott Power 6/45';
    case 'power_535':
      return 'Vietlott Power 5/35';
    case 'custom':
    default:
      return 'Custom Lottery Game';
  }
}

export function computeLotteryProbability(
  input: LotteryProbabilityInput
): LotteryProbabilityOutput {
  const n = input.totalNumbers;
  const k = input.pickNumbers;

  const totalCombinations = combinations(n, k);
  const jackpotProbabilityPerTicket =
    totalCombinations > 0 ? 1 / totalCombinations : 0;
  const jackpotOddsOneIn =
    jackpotProbabilityPerTicket > 0 ? 1 / jackpotProbabilityPerTicket : 0;

  const totalTickets = input.draws * input.ticketsPerDraw;
  const probabilityAtLeastOneJackpot =
    totalTickets > 0 && jackpotProbabilityPerTicket > 0
      ? 1 - Math.pow(1 - jackpotProbabilityPerTicket, totalTickets)
      : 0;

  const expectedPrizePerTicket =
    jackpotProbabilityPerTicket * input.jackpotPrize;
  const expectedValuePerTicket = expectedPrizePerTicket - input.ticketPrice;

  const expectedTotalSpend = input.ticketPrice * totalTickets;
  const expectedTotalWinnings = expectedPrizePerTicket * totalTickets;

  const gameName = getGameName(input);

  const explanation = [
    `This calculation assumes a fair ${gameName} lottery where every combination of numbers is equally likely.`,
    `Jackpot odds per ticket: 1 in approximately ${Math.round(
      jackpotOddsOneIn || 0
    ).toLocaleString('en-US')}.`,
    `Expected value per ticket is negative in almost all realistic configurations, meaning lottery tickets are mathematically a paid form of entertainment, not an investment.`,
  ].join(' ');

  const disclaimer =
    'This tool is for educational purposes only and does not encourage or promote gambling. Lottery participation may be regulated by law in your jurisdiction. Always play responsibly and only with money you can afford to lose.';

  return {
    gameName,
    totalCombinations,
    jackpotProbabilityPerTicket,
    jackpotOddsOneIn,
    expectedValuePerTicket,
    expectedPrizePerTicket,
    totalTickets,
    probabilityAtLeastOneJackpot,
    expectedTotalSpend,
    expectedTotalWinnings,
    explanation,
    disclaimer,
    aiNarrative: null,
    aiRiskNotes: null,
  };
}

export function lotteryHandler(
  aiResponse: string,
  input: LotteryProbabilityInput
): LotteryProbabilityOutput {
  const base = computeLotteryProbability(input);

  let aiNarrative: string | null = null;
  let aiRiskNotes: string | null = null;

  let jsonStr = aiResponse.trim();

  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  }
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }

  try {
    const parsed = JSON.parse(jsonStr.trim());

    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.narrative === 'string') {
        aiNarrative = parsed.narrative;
      }
      if (typeof parsed.riskNotes === 'string') {
        aiRiskNotes = parsed.riskNotes;
      }
    }
  } catch {
    // If AI response is not valid JSON, silently ignore and fall back to deterministic explanation.
  }

  return {
    ...base,
    aiNarrative,
    aiRiskNotes,
  };
}

