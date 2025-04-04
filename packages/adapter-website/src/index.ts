import PQueue from 'p-queue';
import { logger } from '@cli-upkaran/core';
import {
  type Adapter,
  type AdapterOptions,
  type ContentItem,
  matchPath,
} from '@cli-upkaran/dataprep-core';
import { fetchUrl, type FetchResult } from './fetch-utils.js';
import { extractReadableContent, type ProcessedPage } from './readability.js';
import { discoverUrls } from './discovery.js';
import ora from 'ora';

const ADAPTER_NAME = 'website';

class WebsiteAdapter implements Adapter {
  public name = ADAPTER_NAME;

  async *getStream(
    source: string,
    options: AdapterOptions,
  ): AsyncIterable<ContentItem> {
    logger.info(`[${this.name}] Starting stream for source: ${source}`);
    logger.verbose(
      `[${this.name}] Adapter options: ${JSON.stringify(options)}`,
    );

    const concurrency = options.concurrency || 5;
    const queue = new PQueue({ concurrency });
    const processedUrls = new Set<string>();
    const resultsBuffer: ContentItem[] = []; // Buffer to store results
    let fetchedCount = 0;
    const limit = options.limit;
    const matchPatterns = options.match;

    const controller = new AbortController();

    const processUrl = async (url: string, depth: number): Promise<void> => {
      if (
        processedUrls.has(url) ||
        (limit && fetchedCount >= limit) ||
        controller.signal.aborted
      ) {
        return;
      }
      processedUrls.add(url);

      const urlObject = new URL(url);
      const urlPath = urlObject.pathname;
      const urlHost = urlObject.hostname;

      // Ensure we stay on the original host (or subdomain if allowed - add option later?)
      // This check might be too simple if the source itself is a specific path
      const sourceHost = new URL(source).hostname;
      if (urlHost !== sourceHost) {
        logger.verbose(`[${this.name}] Skipping URL on different host: ${url}`);
        return;
      }

      if (matchPatterns && !matchPath(urlPath, matchPatterns)) {
        logger.verbose(
          `[${this.name}] Skipping non-matching URL path: ${urlPath} (from ${url})`,
        );
        return;
      }

      if (limit && fetchedCount >= limit) {
        if (!controller.signal.aborted) {
          logger.info(
            `[${this.name}] Fetch limit (${limit}) reached. Aborting further fetches.`,
          );
          controller.abort();
          queue.clear();
        }
        return;
      }

      const spinner = ora(`Fetching: ${url} (Depth: ${depth})`);

      let fetchResult: FetchResult | null = null;
      let fetchError: Error | undefined;
      try {
        spinner.start();
        fetchResult = await fetchUrl(url, controller.signal);
      } catch (error: any) {
        logger.warn(`[${this.name}] Failed to fetch ${url}: ${error.message}`);
        fetchError = new Error(`Fetch failed: ${error.message}`);
      } finally {
        if (controller.signal.aborted) {
          spinner.warn(`Aborted: ${url}`);
        } else if (fetchError) {
          spinner.fail(`Failed: ${url}`);
        } else {
          spinner.succeed(`Fetched: ${url} (${fetchResult?.status ?? '?'})`);
        }
      }

      if (controller.signal.aborted) {
        logger.verbose(`[${this.name}] Fetch aborted for ${url}`);
        return; // Aborted during fetch
      }

      // Increment count even if fetch failed, to respect limit
      fetchedCount++;
      logger.verbose(
        `[${this.name}] Processed ${url}. Count: ${fetchedCount}/${limit ?? 'unlimited'}`,
      );

      // Process content if fetch was successful
      let pageData: ProcessedPage | null = null;
      if (fetchResult && fetchResult.contentType?.includes('html')) {
        try {
          pageData = await extractReadableContent(
            fetchResult.content,
            url,
            options.contentSelector,
          );
        } catch (readabilityError: any) {
          logger.warn(
            `[${this.name}] Readability failed for ${url}: ${readabilityError.message}`,
          );
          fetchError =
            fetchError ||
            new Error(`Readability failed: ${readabilityError.message}`); // Keep original fetch error if it existed
        }
      } else if (fetchResult) {
        logger.verbose(
          `[${this.name}] Skipping content processing for non-HTML type (${fetchResult.contentType}) for: ${url}`,
        );
      }

      // Add item to buffer (even if there was an error)
      resultsBuffer.push({
        id: url,
        source: source,
        adapter: this.name,
        type: pageData
          ? 'text'
          : fetchResult?.contentType?.includes('image')
            ? 'image'
            : 'other',
        content: pageData?.markdownContent ?? null,
        metadata: {
          title: pageData?.title,
          originalUrl: url,
          fetchUrl: fetchResult?.finalUrl,
          contentType: fetchResult?.contentType,
          httpStatus: fetchResult?.status,
          headers: fetchResult?.headers,
          depth: depth,
        },
        error: fetchError,
      });

      // Discover and queue new URLs if fetch was successful, content is HTML, and depth allows
      if (fetchResult && pageData && depth < (options.depth ?? 3)) {
        try {
          const discovered = await discoverUrls(
            fetchResult.content,
            url,
            source,
            options.useSitemap,
          );
          for (const nextUrl of discovered) {
            if (
              !processedUrls.has(nextUrl) &&
              (!limit || fetchedCount < limit)
            ) {
              // Log adding subsequent URLs
              logger.verbose(
                `[${this.name}] Adding discovered URL to queue: ${nextUrl}`,
              );
              queue.add(() => processUrl(nextUrl, depth + 1));
            }
          }
          logger.verbose(
            `[${this.name}] Discovered ${discovered.length} URLs from ${url}. Queue size: ${queue.size}`,
          );
        } catch (discoveryError: any) {
          logger.warn(
            `[${this.name}] Error discovering links on ${url}: ${discoveryError.message}`,
          );
          // Optionally add this error to the current item?
        }
      }
    };

    // Start the process
    const initialUrls = await discoverUrls(
      null,
      source,
      source,
      options.useSitemap,
    );
    if (initialUrls.length === 0) {
      logger.warn(
        `[${this.name}] No initial URLs found from source: ${source}`,
      );
      if (!source.toLowerCase().endsWith('.xml')) {
        logger.info(`[${this.name}] Treating source as single URL to fetch.`);
        queue.add(() => processUrl(source, 0));
      } else {
        // If no initial URLs and it looks like a sitemap, yield nothing and exit.
        logger.info(
          `[${this.name}] No URLs found in sitemap, finishing stream.`,
        );
        return;
      }
    } else {
      logger.info(
        `[${this.name}] Starting crawl/fetch with ${initialUrls.length} initial URLs.`,
      );
      // Log the initial URLs found
      logger.verbose(
        `[${this.name}] Initial URLs: ${JSON.stringify(initialUrls)}`,
      );
      initialUrls.forEach((url) => {
        logger.verbose(`[${this.name}] Adding initial URL to queue: ${url}`);
        queue.add(() => processUrl(url, 0));
      });
    }

    // Stream results as they become available
    logger.verbose(`[${this.name}] Entering streaming loop...`);
    while (queue.size > 0 || queue.pending > 0 || resultsBuffer.length > 0) {
      // Log queue and buffer state at start of loop iteration
      logger.verbose(
        `[${this.name}] Loop State - Queue Size: ${queue.size}, Pending: ${queue.pending}, Buffer Length: ${resultsBuffer.length}`,
      );

      // Yield all items currently in the buffer
      while (resultsBuffer.length > 0) {
        yield resultsBuffer.shift()!;
      }
      // If buffer is empty but queue is still processing, wait briefly
      if (resultsBuffer.length === 0 && (queue.size > 0 || queue.pending > 0)) {
        await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay
      }
    }

    logger.info(
      `[${this.name}] Queue idle and buffer empty. Finished yielding all items.`,
    );
  }
}

/**
 * Factory function to create a WebsiteAdapter instance.
 */
export function createWebsiteAdapter(): Adapter {
  return new WebsiteAdapter();
}
