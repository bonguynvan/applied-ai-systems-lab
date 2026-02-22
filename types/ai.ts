export type ModelProvider = 'openai' | 'anthropic' | 'groq' | 'google';

export interface AICallOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  streaming?: boolean;
  retryCount?: number;
  timeout?: number;
  userKeys?: {
    openai?: string;
    anthropic?: string;
    google?: string;
    groq?: string;
  };
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'max_tokens' | 'stop_sequence';
}

export interface AICallResult extends AIResponse {
  latency: number;
  cost: number;
  cached: boolean;
}

export interface ModelConfig {
  provider: ModelProvider;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
}

export interface TokenEstimate {
  input: number;
  output: number;
  total: number;
}
