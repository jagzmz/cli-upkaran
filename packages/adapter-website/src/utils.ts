// Add any website/fetching-specific utility functions here.
// For example, functions to normalize URLs, handle specific meta tags, etc.

/**
 * Example utility function for website adapter.
 * Normalizes a URL string (e.g., removes trailing slash, converts to lowercase hostname).
 *
 * @param urlString - The URL string to normalize.
 * @returns The normalized URL string, or the original if parsing fails.
 */
export function normalizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    // Example normalizations:
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname.endsWith('/') && url.pathname !== '/') {
      url.pathname = url.pathname.slice(0, -1);
    }
    url.hash = ''; // Remove fragment
    // url.search = ''; // Optionally remove query parameters?
    return url.toString();
  } catch {
    // If URL parsing fails, return the original string
    return urlString;
  }
}
