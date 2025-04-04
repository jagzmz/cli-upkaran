import type { Writable } from 'node:stream';
import { logger, DataPrepError } from '@cli-upkaran/core';
import type { Adapter, AdapterOptions } from './adapters.js';
import type { ContentItem } from './content-item.js';
import type { Transformer, TransformContext } from './transformers.js';
import type { Formatter, FormatterOptions } from './formatters.js';

/**
 * Options for running the data preparation pipeline.
 */
export interface PipelineOptions {
  adapterOptions?: AdapterOptions;
  formatterOptions?: FormatterOptions;
  transformContext?: TransformContext;
}

/**
 * Runs the data preparation pipeline: Adapter -> Transformers -> Formatter.
 *
 * @param adapter - The data adapter instance.
 * @param transformers - An array of transformer instances.
 * @param formatter - The formatter instance.
 * @param source - The source identifier for the adapter.
 * @param outputStream - The stream to write the final formatted output to.
 * @param options - Optional configuration for the pipeline stages.
 */
export async function runPipeline(
  adapter: Adapter,
  transformers: Transformer[],
  formatter: Formatter,
  source: string,
  outputStream: Writable,
  options: PipelineOptions = {},
): Promise<{ itemCount: number; errorCount: number }> {
  logger.info(`Starting data preparation pipeline for source: ${source}`);
  logger.verbose(
    `Adapter: ${adapter.name}, Transformers: ${transformers.map((t) => t.name).join(', ') || 'None'}, Formatter: ${formatter.name}`,
  );

  let itemCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  try {
    // 1. Get stream from Adapter
    const adapterStream = adapter.getStream(
      source,
      options.adapterOptions || {},
    );

    // 2. Apply Transformers
    const transformedStream = applyTransformers(
      adapterStream,
      transformers,
      options.transformContext || {},
    );

    async function* transformedStreamWrapper() {
      for await (const item of transformedStream) {
        itemCount++;
        if (item.error) {
          errorCount++;
          logger.warn(
            `Error processing item ${item.id}: ${item.error.message}`,
          );
          logger.verbose(item.error.stack);
          // Decide whether to include errored items in the output - currently including
        }
        yield item;
      }
    }

    await formatter.format(
      transformedStreamWrapper(),
      outputStream,
      options.formatterOptions,
    );

    const duration = (Date.now() - startTime) / 1000;
    logger.success(`Pipeline completed in ${duration.toFixed(2)}s.`);
    logger.info(
      `Processed ${itemCount} items, encountered ${errorCount} errors.`,
    );

    return { itemCount, errorCount };
  } catch (error: any) {
    const pipelineError = new DataPrepError(
      `Pipeline execution failed: ${error.message}`,
      error,
    );
    logger.error(pipelineError.message);
    if (error.stack) {
      logger.verbose(error.stack);
    }
    throw pipelineError; // Re-throw the structured error
  }
}

/**
 * Helper function to apply transformers to the ContentItem stream.
 */
async function* applyTransformers(
  inputStream: AsyncIterable<ContentItem>,
  transformers: Transformer[],
  context: TransformContext,
): AsyncIterable<ContentItem> {
  if (transformers.length === 0) {
    yield* inputStream; // No transformers, pass through
    return;
  }

  logger.verbose(`Applying ${transformers.length} transformers...`);

  for await (const item of inputStream) {
    let currentItem: ContentItem | null = item;

    for (const transformer of transformers) {
      if (currentItem === null) break; // Item was filtered out by a previous transformer

      try {
        // Reset error before each transformer potentially modifies it
        // currentItem.error = undefined;

        const result = await transformer.transform(currentItem, context);
        currentItem = result;

        if (currentItem === null) {
          logger.verbose(
            `Item ${item.id} filtered out by transformer: ${transformer.name}`,
          );
          break;
        }
      } catch (err: any) {
        logger.warn(
          `Transformer ${transformer.name} failed for item ${item.id}: ${err.message}`,
        );
        logger.verbose(err.stack);
        // Attach error to the item for potential downstream handling or reporting
        if (currentItem) {
          currentItem.error = new DataPrepError(
            `Transformer ${transformer.name} failed`,
            err,
          );
        }
        // Decide if processing should stop for this item upon transformer error
        // currentItem = null; // Uncomment to filter out items that cause transformer errors
        // break; // Uncomment to stop applying further transformers to this item
      }
    }

    if (currentItem !== null) {
      yield currentItem;
    }
  }
  logger.verbose('Finished applying transformers.');
}
