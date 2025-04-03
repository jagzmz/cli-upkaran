import path from 'node:path';
import { createWriteStream, promises as fs } from 'node:fs';
import { logger, DataPrepError } from '@cli-upkaran/core';
import {
  runPipeline,
  createIgnoreFilter,
  readIgnoreFile,
  type AdapterOptions,
  type FormatterOptions,
  type Transformer,
  type ContentItem,
  defaultFormatters,
  // TODO: Import specific formatters when they exist
  // import { createMarkdownFormatter, createJsonFormatter } from '../formatters';
} from '@cli-upkaran/dataprep-core';
import { createFileSystemAdapter } from '@cli-upkaran/adapter-filesystem';
import type { DigestOptions } from './options.js';
import { DEFAULT_IGNORES } from './default-ignores.js'; // Define default ignores for digest

/**
 * Executes the main logic for the digest command.
 */
export async function runDigest(
  inputDir: string,
  outputFile: string,
  options: DigestOptions,
): Promise<void> {
  logger.info(`Starting digest command for directory: ${inputDir}`);
  logger.info(`Outputting to: ${outputFile}`);
  logger.verbose(`Digest options: ${JSON.stringify(options)}`);

  const outputStream = createWriteStream(outputFile);
  outputStream.on('error', (err) => {
    logger.error(`Error writing to output file ${outputFile}:`, err);
    // Consider how to handle pipeline cleanup here
  });

  try {
    // 1. Prepare Ignore Filters
    const ignoreSources: { [key: string]: string[] } = {};
    ignoreSources.cli = options.ignore || [];
    if (options.defaultIgnores) {
      ignoreSources.default = DEFAULT_IGNORES;
    }
    const customIgnorePath = path.resolve(
      inputDir,
      options.ignoreFile || '.ai-upkaran-ignore',
    );
    ignoreSources.customFile = await readIgnoreFile(customIgnorePath);

    if (options.useGitignore) {
      const gitignorePath = path.resolve(inputDir, '.gitignore');
      ignoreSources.gitignore = await readIgnoreFile(gitignorePath);
    }

    // 2. Configure Adapter
    const adapterOptions: AdapterOptions = {
      // Pass ignore patterns directly to adapter if it supports them,
      // or handle filtering within the command/pipeline logic.
      // For FileSystemAdapter, it likely handles ignore internally.
      ignorePatterns: {
        default: options.defaultIgnores ? DEFAULT_IGNORES : [],
        cli: options.ignore || [],
        customFile: ignoreSources.customFile,
        gitignore: options.useGitignore ? ignoreSources.gitignore : [],
      },
      ignoreFilePath: customIgnorePath,
      useGitignore: options.useGitignore,
      // Match patterns could also be passed if needed
    };
    const adapter = createFileSystemAdapter(); // Assuming a factory function

    // 3. Select Formatter
    // TODO: Replace with actual formatters
    const formatter =
      options.format === 'json'
        ? defaultFormatters.json
        : defaultFormatters.markdown;
    const formatterOptions: FormatterOptions = {
      includeSource: true, // Example option
    };

    // 4. Select Transformers (Example - whitespace removal)
    const transformers: Transformer[] = [];
    if (options.whitespaceRemoval) {
      // TODO: Add a real whitespace removal transformer
      // transformers.push(createWhitespaceTransformer());
      logger.warn('Whitespace removal transformer not implemented yet.');
    }
    // TODO: Load transformers based on options.transform

    // 5. Run the Pipeline
    logger.info('Starting data preparation pipeline...');
    const { itemCount, errorCount } = await runPipeline(
      adapter,
      transformers,
      formatter,
      inputDir, // Source for the adapter
      outputStream,
      {
        adapterOptions,
        formatterOptions,
        transformContext: { flags: options }, // Pass command flags as context
      },
    );

    logger.success(`Digest command finished. Processed ${itemCount} files.`);
    if (errorCount > 0) {
      logger.warn(`Encountered ${errorCount} errors during processing.`);
    }

    // TODO: Implement --show-output-files logic (might need data from pipeline result)
    if (options.showOutputFiles) {
      logger.warn('--show-output-files is not fully implemented yet.');
    }
  } catch (error) {
    // Catch pipeline errors and log appropriately
    if (error instanceof DataPrepError) {
      logger.error('Data preparation pipeline failed:', error.message);
      if (error.cause) {
        logger.error('Underlying cause:', error.cause);
      }
    } else {
      logger.error('An unexpected error occurred during digest:', error);
    }
    // Ensure stream is closed on error?
    outputStream.end();
    // Re-throw to allow main CLI error handler to exit
    throw error;
  } finally {
    // Ensure the output stream is closed when done
    if (!outputStream.closed) {
      outputStream.end();
    }
  }
}
