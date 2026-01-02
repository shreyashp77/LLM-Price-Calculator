import { OpenRouterModel, UnifiedModelData } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/models';
const CACHE_KEY = 'llm_pricing_cache_v2'; // Version bump to clear stale data
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CacheData {
  timestamp: number;
  models: UnifiedModelData[];
}

const guessProvider = (id: string, name: string): string => {
  const lowerId = id.toLowerCase();
  
  if (lowerId.startsWith('openai/')) return 'OpenAI';
  if (lowerId.startsWith('google/')) return 'Google';
  if (lowerId.startsWith('anthropic/')) return 'Anthropic';
  if (lowerId.startsWith('mistral')) return 'Mistral';
  if (lowerId.startsWith('meta-llama/')) return 'Meta';
  if (lowerId.startsWith('meta/')) return 'Meta';
  if (lowerId.startsWith('cohere/')) return 'Cohere';
  if (lowerId.startsWith('deepseek/')) return 'DeepSeek';
  if (lowerId.startsWith('qwen/')) return 'Alibaba';
  if (lowerId.startsWith('microsoft/')) return 'Microsoft';
  if (lowerId.startsWith('perplexity/')) return 'Perplexity';
  
  // Fallback: take the first part of the ID before the slash
  const parts = id.split('/');
  if (parts.length > 1) {
    const key = parts[0].toLowerCase();
    // Capitalize first letter
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
  
  return 'Other';
};

// Robust helper to parse price strings/numbers
const parsePrice = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  // Convert to string then parse to handle both number and string types from API
  const parsed = parseFloat(String(value));
  if (isNaN(parsed)) return 0;
  // Filter out negative pricing (sometimes used for unknown prices)
  return Math.max(0, parsed);
};

export const fetchModels = async (): Promise<UnifiedModelData[]> => {
  // Check Cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsedCache: CacheData = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        console.log('Using cached pricing data');
        return parsedCache.models;
      }
    } catch (e) {
      console.warn("Invalid cache data, clearing");
      localStorage.removeItem(CACHE_KEY);
    }
  }

  try {
    console.log('Fetching fresh pricing data from OpenRouter...');
    const response = await fetch(OPENROUTER_API_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const json = await response.json();
    const rawModels: OpenRouterModel[] = json.data;

    if (!Array.isArray(rawModels)) {
      throw new Error("Invalid API response structure: data is not an array");
    }

    const normalizedModels: UnifiedModelData[] = rawModels.map((model) => {
      // Use optional chaining to safely access pricing properties
      // The previous code `model.pricing || {}` caused a type error because {} does not have 'prompt' or 'completion'
      const pricing = model.pricing;
      
      // Parse pricing - usually strings like "0.000005"
      // We accept strings or numbers and handle missing fields gracefully
      const promptPrice = parsePrice(pricing?.prompt);
      const completionPrice = parsePrice(pricing?.completion);

      return {
        id: model.id,
        name: model.name,
        provider: guessProvider(model.id, model.name),
        // Convert per-token price to per-million (price * 1,000,000)
        inputPricePerMillion: promptPrice * 1_000_000,
        outputPricePerMillion: completionPrice * 1_000_000,
        contextWindow: model.context_length || 0,
      };
    });

    // Save to cache
    const cacheData: CacheData = {
      timestamp: Date.now(),
      models: normalizedModels,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    return normalizedModels;

  } catch (error) {
    console.error("Error fetching pricing:", error);
    // If fetch fails but we have stale cache (even if expired), try to return it
    if (cached) {
       console.warn("Returning stale cache due to fetch error");
       try {
         return JSON.parse(cached).models;
       } catch (e) { /* ignore */ }
    }
    throw error;
  }
};

export const calculateModelCost = (
  model: UnifiedModelData, 
  inputTokens: number, 
  outputTokens: number
) => {
  // inputPricePerMillion is $/1M tokens. 
  // Formula: (tokens / 1,000,000) * price_per_million
  
  const inputCost = (inputTokens / 1_000_000) * model.inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * model.outputPricePerMillion;
  
  return {
    model,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost
  };
};