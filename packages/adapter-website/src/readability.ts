import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
// @ts-ignore
import { gfm } from 'turndown-plugin-gfm';
import * as cheerio from 'cheerio';
import { logger } from '@ai-upkaran/core';

export interface ProcessedPage {
  title: string;
  markdownContent: string;
  // textContent?: string; // Optional raw text
  // length?: number; // Original HTML length?
  // excerpt?: string;
}

// Initialize Turndown service once
const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.use(gfm);

/**
 * Extracts readable content from HTML using Readability and converts it to Markdown.
 *
 * @param htmlContent - The raw HTML string.
 * @param url - The URL of the page (used by Readability).
 * @param contentSelector - Optional CSS selector to narrow down the content area before Readability.
 * @returns Processed page data or null if extraction fails.
 */
export async function extractReadableContent(
  htmlContent: string,
  url: string,
  contentSelector?: string,
): Promise<ProcessedPage | null> {
  logger.verbose(`[readability] Extracting content for: ${url}`);
  let targetHtml = htmlContent;

  if (contentSelector) {
    try {
      const $ = cheerio.load(htmlContent);
      const selectedContent = $(contentSelector).html();
      if (selectedContent) {
        // Use selected content, but wrap it minimally for Readability
        targetHtml = `<body>${selectedContent}</body>`;
        logger.verbose(
          `[readability] Using content from selector: ${contentSelector}`,
        );
      } else {
        logger.warn(
          `[readability] Content selector "${contentSelector}" did not match any content on ${url}. Falling back to full page.`,
        );
        targetHtml = htmlContent; // Fallback to full HTML
      }
    } catch (selectorError: any) {
      logger.warn(
        `[readability] Error applying content selector "${contentSelector}" on ${url}: ${selectorError.message}. Falling back to full page.`,
      );
      targetHtml = htmlContent; // Fallback
    }
  }

  try {
    // Use JSDOM to create a DOM environment for Readability
    const dom = new JSDOM(targetHtml, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      logger.warn(
        `[readability] Readability could not parse article for: ${url}`,
      );
      return null;
    }

    // Convert the extracted HTML content to Markdown
    const markdownContent = turndownService.turndown(article.content);

    logger.verbose(
      `[readability] Successfully extracted content. Title: ${article.title}, Length (MD): ${markdownContent.length}`,
    );

    return {
      title: article.title || 'Untitled', // Use title from Readability
      markdownContent: markdownContent,
      // textContent: article.textContent, // Could include raw text
    };
  } catch (error: any) {
    logger.error(
      `[readability] Error during Readability processing for ${url}: ${error.message}`,
    );
    logger.verbose(error.stack); // Log full stack in verbose mode
    return null;
  }
}
