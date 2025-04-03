import {
  encodingForModel,
  type Tiktoken,
  type TiktokenModel,
} from 'js-tiktoken';
import { logger } from '@ai-upkaran/core';

let tokenizer: Tiktoken | null = null;
const DEFAULT_MODEL: TiktokenModel = 'gpt-4o'; // Use a recent model for estimation

/**
 * Initializes and returns the tokenizer instance.
 * Uses a singleton pattern to avoid reloading the model repeatedly.
 *
 * @param model - The Tiktoken model to use (e.g., 'gpt-4', 'gpt-3.5-turbo'). Defaults to gpt-4o
 * @returns The Tiktoken instance.
 */
function getTokenizer(model: TiktokenModel = DEFAULT_MODEL): Tiktoken {
  if (!tokenizer) {
    try {
      logger.verbose(`Initializing tokenizer for model: ${model}`);
      tokenizer = encodingForModel(model);
      logger.verbose('Tokenizer initialized successfully.');
    } catch (error) {
      logger.error(`Failed to initialize tokenizer for model ${model}:`, error);
      // Fallback or rethrow? For now, let it throw.
      throw new Error(`Could not load tokenizer for model ${model}`);
    }
  }
  return tokenizer;
}

/**
 * Estimates the number of tokens in a given text using the specified model's tokenizer.
 *
 * @param text - The text to estimate tokens for.
 * @param model - The model context to use for tokenization (defaults to gpt-4o).
 * @returns The estimated number of tokens, or 0 if tokenization fails.
 */
export function estimateTokenCount(
  text: string,
  model: TiktokenModel = DEFAULT_MODEL,
): number {
  if (!text) {
    return 0;
  }
  try {
    const enc = getTokenizer(model);
    const tokens = enc.encode(text);
    return tokens.length;
  } catch (error) {
    // Log the error but return 0 as a fallback count
    logger.warn(`Token estimation failed for model ${model}:`, error);
    return 0;
  }
}

/**
 * Estimates the token count for a ContentItem, considering only its content.
 *
 * @param item - The ContentItem.
 * @param model - The model context.
 * @returns The estimated token count for the item's content.
 */
export function estimateContentItemTokens(
  item: import('./content-item.js').ContentItem,
  model: TiktokenModel = DEFAULT_MODEL,
): number {
  if (item.type === 'text' && item.content) {
    return estimateTokenCount(item.content, model);
  }
  return 0; // Binary or empty content has 0 tokens
}

// Note: js-tiktoken might require wasm bindings. Ensure these are handled
// correctly during packaging or runtime if targeting environments without
// native filesystem access (like some serverless functions).
