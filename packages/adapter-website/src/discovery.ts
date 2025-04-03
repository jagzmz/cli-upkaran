import { logger } from '@cli-upkaran/core';
import * as cheerio from 'cheerio';
import { fetchUrl } from './fetch-utils.js';
import { XMLParser } from 'fast-xml-parser';

/**
 * Discovers URLs from HTML content, a sitemap, or a starting URL.
 *
 * @param htmlContent - Optional HTML content to parse for links.
 * @param baseUrl - The base URL for resolving relative links found in HTML.
 * @param sourceUrlOrPath - The original source (starting URL or sitemap path/URL).
 * @param useSitemap - Flag indicating whether to prioritize fetching and parsing a sitemap.
 * @returns A promise resolving to an array of discovered absolute URLs.
 */
export async function discoverUrls(
  htmlContent: string | null,
  baseUrl: string,
  sourceUrlOrPath: string,
  useSitemap: boolean = true,
): Promise<string[]> {
  const discovered = new Set<string>();
  const base = new URL(baseUrl);
  const sourceIsSitemap = sourceUrlOrPath.toLowerCase().endsWith('.xml');

  // 1. Prioritize Sitemap if requested and applicable
  if (useSitemap) {
    let sitemapUrl = '';
    if (sourceIsSitemap) {
      sitemapUrl = sourceUrlOrPath;
    } else {
      // Attempt to find sitemap at common location relative to baseUrl
      try {
        sitemapUrl = new URL('/sitemap.xml', base).toString();
      } catch {
        /* Ignore URL constructor error */
      }
    }

    if (sitemapUrl) {
      logger.info(
        `[discovery] Attempting to fetch and parse sitemap: ${sitemapUrl}`,
      );
      const sitemapUrls = await parseSitemap(sitemapUrl);
      if (sitemapUrls.length > 0) {
        logger.info(`[discovery] Found ${sitemapUrls.length} URLs in sitemap.`);
        sitemapUrls.forEach((url) => discovered.add(url));
        // If sitemap was successfully used, we might not need HTML parsing
        // unless we want to crawl *beyond* the sitemap.
        // For now, if sitemap is used, we return just its contents.
        return Array.from(discovered);
      }
    }
  }

  // 2. Parse HTML content if provided (and sitemap wasn't used or failed)
  if (htmlContent) {
    logger.verbose(`[discovery] Parsing HTML from ${baseUrl} for links.`);
    try {
      const $ = cheerio.load(htmlContent);
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          try {
            const absoluteUrl = new URL(href, base.toString()).toString();
            // Basic filtering (stay on same host, avoid fragments)
            if (
              new URL(absoluteUrl).hostname === base.hostname &&
              !absoluteUrl.includes('#')
            ) {
              discovered.add(absoluteUrl);
            }
          } catch (urlError) {
            logger.verbose(`[discovery] Skipping invalid href: ${href}`);
          }
        }
      });
      logger.verbose(
        `[discovery] Found ${discovered.size} potential URLs in HTML.`,
      );
    } catch (parseError: any) {
      logger.warn(
        `[discovery] Error parsing HTML content from ${baseUrl}: ${parseError.message}`,
      );
    }
  }
  // If no HTML and no sitemap, and source wasn't a sitemap, add the source itself?
  else if (!sourceIsSitemap && discovered.size === 0 && useSitemap === false) {
    logger.verbose(
      `[discovery] No HTML or sitemap, adding source URL: ${sourceUrlOrPath}`,
    );
    discovered.add(sourceUrlOrPath); // Add the starting point if nothing else found
  }

  return Array.from(discovered);
}

/**
 * Fetches and parses a sitemap.xml file.
 *
 * @param sitemapUrl - The URL of the sitemap.
 * @returns A promise resolving to an array of URLs found in the sitemap.
 */
async function parseSitemap(sitemapUrl: string): Promise<string[]> {
  const urls: string[] = [];
  try {
    const fetchResult = await fetchUrl(sitemapUrl);
    if (!fetchResult || !fetchResult.content) {
      logger.warn(
        `[discovery] Failed to fetch sitemap content from ${sitemapUrl}.`,
      );
      return [];
    }

    // Check content type - should be XML
    if (!fetchResult.contentType?.includes('xml')) {
      logger.warn(
        `[discovery] Unexpected content type for sitemap (${fetchResult.contentType}) at ${sitemapUrl}. Attempting to parse anyway.`,
      );
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const jsonObj = parser.parse(fetchResult.content);

    // Handle standard sitemap structure
    if (jsonObj.urlset && Array.isArray(jsonObj.urlset.url)) {
      for (const urlEntry of jsonObj.urlset.url) {
        if (urlEntry.loc) {
          urls.push(String(urlEntry.loc)); // Ensure it's a string
        }
      }
    }
    // Handle sitemap index structure
    else if (
      jsonObj.sitemapindex &&
      Array.isArray(jsonObj.sitemapindex.sitemap)
    ) {
      logger.info(
        `[discovery] Found sitemap index at ${sitemapUrl}. Fetching sub-sitemaps...`,
      );
      const subSitemapPromises = jsonObj.sitemapindex.sitemap.map(
        (sitemapEntry: any) => {
          if (sitemapEntry.loc) {
            return parseSitemap(String(sitemapEntry.loc)); // Recursively parse sub-sitemaps
          }
          return Promise.resolve([]);
        },
      );
      const results = await Promise.all(subSitemapPromises);
      results.forEach((subUrls) => urls.push(...subUrls)); // Flatten results
    } else {
      logger.warn(
        `[discovery] Unrecognized sitemap structure at ${sitemapUrl}. Root keys: ${Object.keys(jsonObj)}`,
      );
    }
  } catch (error: any) {
    logger.error(
      `[discovery] Error parsing sitemap ${sitemapUrl}: ${error.message}`,
    );
  }
  return urls;
}
