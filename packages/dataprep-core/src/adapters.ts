import type { ContentItem } from './content-item.js';

/**
 * Options passed to an Adapter's getStream method.
 * Contains generic options plus adapter-specific ones.
 */
export interface AdapterOptions {
  /** Glob patterns or specific paths/URLs to include */
  match?: string | string[];
  /** Glob patterns or specific paths/URLs to exclude */
  ignore?: string | string[];
  /** Whether to use .gitignore rules (specific to filesystem adapter) */
  useGitignore?: boolean;
  /** Custom ignore file path (specific to filesystem adapter) */
  ignoreFile?: string;
  /** Maximum number of items to fetch (specific to website adapter) */
  limit?: number;
  /** Crawling depth (specific to website adapter) */
  depth?: number;
  /** Concurrency level (specific to website adapter) */
  concurrency?: number;
  /** Add any other adapter-specific options using index signature */
  [key: string]: any;
}

/**
 * Interface for Data Preparation Adapters.
 * Adapters are responsible for fetching raw content from a source (filesystem, website, etc.)
 * and yielding ContentItem objects.
 */
export interface Adapter {
  /** The unique name of the adapter (e.g., 'filesystem', 'website') */
  name: string;

  /**
   * Retrieves content from the specified source and yields ContentItems.
   *
   * @param source - The source identifier (e.g., directory path, URL).
   * @param options - Configuration options for the adapter.
   * @returns An async iterable yielding ContentItem objects.
   */
  getStream(
    source: string,
    options: AdapterOptions,
  ): AsyncIterable<ContentItem>;
}
