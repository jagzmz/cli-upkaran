/**
 * Represents a single piece of content extracted by an Adapter.
 */
export interface ContentItem {
  /** A unique identifier for the item (e.g., file path, URL) */
  id: string;
  /** The original source identifier (e.g., input directory, base URL) */
  source: string;
  /** The name of the adapter that generated this item */
  adapter: string;
  /** The type of content */
  type: 'text' | 'binary' | 'image' | 'svg' | 'other'; // Add more specific types as needed
  /** The actual content (null for binary types initially, might be populated by transformers) */
  content: string | null;
  /** Optional metadata associated with the item (e.g., file stats, HTTP headers, title) */
  metadata?: Record<string, any>;
  /** Optional error encountered during processing this specific item */
  error?: Error;
}
