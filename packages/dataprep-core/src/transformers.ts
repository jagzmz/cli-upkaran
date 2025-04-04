import type { ContentItem } from './content-item.js';

/**
 * Context object passed to transformers.
 * Can contain shared state or configuration needed during transformation.
 */
export interface TransformContext {
  // Example: Global settings relevant to transformations
  flags?: Record<string, unknown>;
  // Add other context properties as needed
}

/**
 * Interface for Data Preparation Transformers.
 * Transformers modify ContentItem objects in the pipeline (e.g., cleaning, extracting data).
 */
export interface Transformer {
  /** The unique name of the transformer (e.g., 'remove-whitespace', 'extract-metadata') */
  name: string;

  /**
   * Transforms a single ContentItem.
   *
   * @param item - The ContentItem to transform.
   * @param context - Shared context for the transformation pipeline.
   * @returns The transformed ContentItem, a new ContentItem, or null to filter it out.
   *          Can be async or synchronous.
   */
  transform(
    item: ContentItem,
    context: TransformContext,
  ): Promise<ContentItem | null> | ContentItem | null;
}
