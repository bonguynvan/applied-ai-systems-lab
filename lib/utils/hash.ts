export async function hashInput(input: any): Promise<string> {
  const inputStr = JSON.stringify(input);
  const encoder = new TextEncoder();
  const data = encoder.encode(inputStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16);
}

export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  // This is a simplification; in production, use proper tokenizers
  return Math.ceil(text.length / 4);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}
