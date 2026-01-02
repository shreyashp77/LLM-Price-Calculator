export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  pricing: {
    prompt: string; // usually per token string
    completion: string; // usually per token string
    image: string;
    request: string;
  };
  top_provider: {
    context_length: number | null;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
}

export interface UnifiedModelData {
  id: string;
  name: string;
  provider: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  contextWindow: number;
}

export interface CostCalculation {
  model: UnifiedModelData;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export type SortField = 'name' | 'provider' | 'inputPrice' | 'outputPrice' | 'totalCost' | 'contextWindow';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  providers: string[]; // specific providers selected
  maxInputPrice: number | null;
  maxOutputPrice: number | null;
}
