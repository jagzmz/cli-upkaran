import { createWriteStream } from 'node:fs';
import { logger, DataPrepError } from '@cli-upkaran/core';
import {
  runPipeline,
  type AdapterOptions,
  type FormatterOptions,
  type Transformer,
  type Formatter,
  defaultFormatters,
} from '@cli-upkaran/dataprep-core';
import { createWebsiteAdapter } from '@cli-upkaran/adapter-website'; // Assuming adapter provides this factory
import type { FetchOptions } from './options.js';

/**
 * Executes the main logic for the fetch command.
 */
export async function runFetch(
  urlOrSitemap: string,
  outputFile: string,
  options: FetchOptions,
): Promise<void> {
  logger.info(`Starting fetch command for source: ${urlOrSitemap}`);
  logger.info(`Outputting to: ${outputFile}`);
  logger.verbose(`Fetch options: ${JSON.stringify(options)}`);

  const outputStream = createWriteStream(outputFile);
  outputStream.on('error', (err) => {
    logger.error(`Error writing to output file ${outputFile}:`, err);
  });

  try {
    // 1. Configure Adapter
    const adapterOptions: AdapterOptions = {
      match: options.match,
      contentSelector: options.selector,
      concurrency: options.concurrency,
      limit: options.limit,
      depth: options.depth,
      useSitemap: options.useSitemap,
      // auth: options.auth, // Pass auth if implemented
    };
    const adapter = createWebsiteAdapter(); // Create instance

    // 2. Select Formatter
    let formatter: Formatter;
    switch (options.format) {
      case 'json':
        formatter = defaultFormatters.json;
        break;
      case 'text':
        formatter = defaultFormatters.text;
        break;
      case 'markdown':
      default:
        formatter = defaultFormatters.markdown;
    }
    const formatterOptions: FormatterOptions = {
      includeSource: true, // e.g., include <url> tag
    };

    // 3. Select Transformers
    const transformers: Transformer[] = [];
    // TODO: Load transformers based on options.transform

    // 4. Run the Pipeline
    logger.info('Starting data preparation pipeline...');
    const { itemCount, errorCount } = await runPipeline(
      adapter,
      transformers,
      formatter,
      urlOrSitemap, // Source for the adapter
      outputStream,
      {
        adapterOptions,
        formatterOptions,
        transformContext: { flags: options as any },
      },
    );

    logger.success(`Fetch command finished. Processed ${itemCount} URLs.`);
    if (errorCount > 0) {
      logger.warn(`Encountered ${errorCount} errors during processing.`);
    }

    // TODO: Implement --show-urls logic
    if (options.showUrls) {
      logger.warn('--show-urls is not fully implemented yet.');
    }
  } catch (error: unknown) {
    logger.error('Fetch command failed.');
    if (error instanceof DataPrepError) {
      logger.error('Pipeline Error:', error.message);
      if (error.cause instanceof Error) {
        logger.error(' Underlying cause:', error.cause.message);
        logger.verbose(error.cause.stack);
      } else if (error.cause) {
        logger.error(' Underlying cause:', error.cause);
      }
    } else if (error instanceof Error) {
      logger.error(' Unexpected Error:', error.message);
      logger.verbose(error.stack);
    } else {
      logger.error(' Unexpected non-error value was thrown:', error);
    }
    throw error;
  } finally {
    if (!outputStream.closed) {
      outputStream.end(() => {
        logger.verbose(`Output stream closed for ${outputFile}`);
      });
    }
  }
}
