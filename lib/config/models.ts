import { ModelConfig } from '@/types/ai';

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4o': {
    provider: 'openai',
    inputCostPer1kTokens: 0.03,
    outputCostPer1kTokens: 0.06,
  },

  'claude-opus-4-6': {
    provider: 'anthropic',
    inputCostPer1kTokens: 0.005,
    outputCostPer1kTokens: 0.025,
  },
  'claude-sonnet-4-6': {
    provider: 'anthropic',
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  'claude-haiku-4-5': {
    provider: 'anthropic',
    inputCostPer1kTokens: 0.001,
    outputCostPer1kTokens: 0.005,
  },
  'claude-sonnet-4-5': {
    provider: 'anthropic',
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  'llama-3.3-70b-versatile': {
    provider: 'groq',
    inputCostPer1kTokens: 0.59 / 1000,
    outputCostPer1kTokens: 0.79 / 1000,
  },
  'llama-3.1-8b-instant': {
    provider: 'groq',
    inputCostPer1kTokens: 0.05 / 1000,
    outputCostPer1kTokens: 0.08 / 1000,
  },
  'llama-4-scout-17b-16e-instruct': {
    provider: 'groq',
    inputCostPer1kTokens: 0.11 / 1000,
    outputCostPer1kTokens: 0.34 / 1000,
  },
  'llama-4-maverick-17b-128e-instruct': {
    provider: 'groq',
    inputCostPer1kTokens: 0.20 / 1000,
    outputCostPer1kTokens: 0.60 / 1000,
  },
  'openai/gpt-oss-120b': {
    provider: 'groq',
    inputCostPer1kTokens: 0.15 / 1000,
    outputCostPer1kTokens: 0.60 / 1000,
  },
  'openai/gpt-oss-20b': {
    provider: 'groq',
    inputCostPer1kTokens: 0.075 / 1000,
    outputCostPer1kTokens: 0.30 / 1000,
  },
  'qwen/qwen3-32b': {
    provider: 'groq',
    inputCostPer1kTokens: 0.29 / 1000,
    outputCostPer1kTokens: 0.59 / 1000,
  },
  'groq/compound': {
    provider: 'groq',
    inputCostPer1kTokens: 0, // Currently free
    outputCostPer1kTokens: 0,
  },

  'gemini-2.5-pro': {
    provider: 'google',
    inputCostPer1kTokens: 0.0035, // Estimated same as 1.5 Pro
    outputCostPer1kTokens: 0.0105,
  },
  'gemini-2.5-flash': {
    provider: 'google',
    inputCostPer1kTokens: 0.00035, // Estimated same as 1.5 Flash
    outputCostPer1kTokens: 0.00105,
  },
  'gemini-2.5-flash-lite': {
    provider: 'google',
    inputCostPer1kTokens: 0.0002, // Estimated slightly cheaper
    outputCostPer1kTokens: 0.0006,
  },
  'gemini-3-pro-preview': {
    provider: 'google',
    inputCostPer1kTokens: 0.0035, // Estimated
    outputCostPer1kTokens: 0.0105,
  },
  'gemini-3-flash-preview': {
    provider: 'google',
    inputCostPer1kTokens: 0.00035, // Estimated
    outputCostPer1kTokens: 0.00105,
  },
  'gemini-2.0-flash': {
    provider: 'google',
    inputCostPer1kTokens: 0.0001, // 2.0 Flash pricing
    outputCostPer1kTokens: 0.0004,
  },
  'gemini-2.0-flash-lite': {
    provider: 'google',
    inputCostPer1kTokens: 0.000075, // 2.0 Flash-Lite pricing
    outputCostPer1kTokens: 0.0003,
  },
};

export const DEFAULT_MODEL = 'gpt-4o';

export function getModelConfig(model: string): ModelConfig {
  const config = MODEL_CONFIGS[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }
  return config;
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const config = getModelConfig(model);
  const inputCost = (inputTokens / 1000) * config.inputCostPer1kTokens;
  const outputCost = (outputTokens / 1000) * config.outputCostPer1kTokens;
  return inputCost + outputCost;
}
