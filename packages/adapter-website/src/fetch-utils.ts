import { logger } from '@cli-upkaran/core';
import fetch, { Response } from 'node-fetch'; // Use node-fetch v3 for ESM

export interface FetchResult {
  finalUrl: string;
  content: string;
  status: number;
  contentType: string | null;
  headers: Record<string, string>;
}

const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT = 15000; // 15 seconds
const USER_AGENT =
  'cli-upkaran-fetcher/0.1 (https://github.com/your-repo/cli-upkaran)'; // Set a descriptive user agent

/**
 * Fetches a URL with timeout, redirect handling, and basic error management.
 *
 * @param urlString - The URL to fetch.
 * @param abortSignal - Optional AbortSignal to cancel the fetch.
 * @returns A promise resolving to FetchResult or null if fetch failed/aborted.
 */
export async function fetchUrl(
  urlString: string,
  abortSignal?: AbortSignal,
): Promise<FetchResult | null> {
  let currentUrl = urlString;
  let redirects = 0;

  while (redirects < MAX_REDIRECTS) {
    if (abortSignal?.aborted) {
      logger.verbose(`[fetch] Aborted before fetching ${currentUrl}`);
      return null;
    }
    logger.verbose(
      `[fetch] Attempting to fetch: ${currentUrl} (Redirects: ${redirects})`,
    );
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      // Combine external signal with timeout signal
      const combinedSignal = abortSignal
        ? anySignal([abortSignal, controller.signal])
        : controller.signal;

      response = await fetch(currentUrl, {
        headers: { 'User-Agent': USER_AGENT },
        signal: combinedSignal,
        redirect: 'manual', // Handle redirects manually
      });

      clearTimeout(timeoutId);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (abortSignal?.aborted) {
          logger.warn(`[fetch] Fetch aborted externally for ${currentUrl}`);
        } else {
          logger.warn(
            `[fetch] Fetch timed out for ${currentUrl} after ${FETCH_TIMEOUT}ms`,
          );
        }
      } else {
        logger.warn(
          `[fetch] Network error fetching ${currentUrl}: ${error.message}`,
        );
      }
      return null; // Indicate fetch failure
    }

    // Check for redirects (3xx status codes)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        try {
          currentUrl = new URL(location, currentUrl).toString(); // Resolve relative redirects
          redirects++;
          logger.verbose(
            `[fetch] Following redirect ${response.status} to: ${currentUrl}`,
          );
          continue; // Go to next iteration of the while loop
        } catch (urlError) {
          logger.warn(
            `[fetch] Invalid redirect location header from ${currentUrl}: ${location}`,
          );
          return null;
        }
      } else {
        logger.warn(
          `[fetch] Received redirect status ${response.status} but no location header from ${currentUrl}`,
        );
        return null; // Cannot follow redirect
      }
    }

    // Handle non-redirect responses
    if (!response.ok) {
      logger.warn(
        `[fetch] HTTP error status ${response.status} for ${currentUrl}`,
      );
      // Return null or maybe FetchResult with error status?
      return null;
    }

    try {
      const content = await response.text();
      const contentType = response.headers.get('content-type');
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        finalUrl: response.url || currentUrl, // Use response.url if available
        content: content,
        status: response.status,
        contentType: contentType,
        headers: headers,
      };
    } catch (error: any) {
      logger.warn(
        `[fetch] Error reading response body from ${currentUrl}: ${error.message}`,
      );
      return null;
    }
  }

  // Max redirects exceeded
  logger.warn(
    `[fetch] Maximum redirects (${MAX_REDIRECTS}) exceeded for initial URL: ${urlString}`,
  );
  return null;
}

/**
 * Helper to combine multiple AbortSignals.
 * Aborts when *any* of the input signals abort.
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), {
      once: true,
      signal: controller.signal,
    });
  }
  return controller.signal;
}
