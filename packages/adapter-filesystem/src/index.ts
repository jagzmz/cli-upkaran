import path from 'node:path';
import { promises as fs } from 'node:fs';
import { glob } from 'glob';
import { isBinaryFile } from 'isbinaryfile';
import { logger } from '@cli-upkaran/core';
import {
  type Adapter,
  type AdapterOptions,
  type ContentItem,
  createIgnoreFilter,
} from '@cli-upkaran/dataprep-core';
import { getFileMetadata } from './utils.js';

const ADAPTER_NAME = 'filesystem';

class FileSystemAdapter implements Adapter {
  public name = ADAPTER_NAME;

  async *getStream(
    source: string,
    options: AdapterOptions,
  ): AsyncIterable<ContentItem> {
    const inputDir = path.resolve(source);
    logger.info(`[${this.name}] Starting stream for directory: ${inputDir}`);
    logger.verbose(
      `[${this.name}] Adapter options: ${JSON.stringify(options)}`,
    );

    try {
      await fs.access(inputDir); // Check if directory exists
    } catch (error) {
      logger.error(
        `[${this.name}] Input directory not found or inaccessible: ${inputDir}`,
      );
      throw new Error(`Input directory not found: ${inputDir}`);
    }

    // --- Prepare Ignore Filters --- S
    // Consolidate ignore patterns from options
    const ignorePatterns = options.ignorePatterns || {}; // Passed from digest command
    const defaultFilter = createIgnoreFilter(
      ignorePatterns.default || [],
      'default patterns',
    );
    const cliFilter = createIgnoreFilter(
      ignorePatterns.cli || [],
      'CLI --ignore',
    );
    const customFileFilter = createIgnoreFilter(
      ignorePatterns.customFile || [],
      options.ignoreFilePath || 'custom ignore file',
    );
    const gitignoreFilter = options.useGitignore
      ? createIgnoreFilter(ignorePatterns.gitignore || [], '.gitignore')
      : undefined;

    const filters = {
      default: defaultFilter,
      cli: cliFilter,
      custom: customFileFilter,
      gitignore: gitignoreFilter,
    };
    // --- End Ignore Filters --- S

    const globPattern = '**/*'; // Process all files within the directory
    const globOptions = {
      cwd: inputDir,
      nodir: true,
      dot: true, // Include dotfiles
      absolute: true, // Get absolute paths for easier processing
      ignore: [path.join(inputDir, 'node_modules/**')], // Basic fast ignore, refine later
    };

    logger.verbose(`[${this.name}] Glob pattern: ${globPattern}`);
    logger.verbose(
      `[${this.name}] Glob options: ${JSON.stringify(globOptions)}`,
    );

    const files = await glob(globPattern, globOptions);
    logger.info(`[${this.name}] Found ${files.length} potential files.`);

    let includedCount = 0;
    for (const absolutePath of files) {
      const relativePath = path.relative(inputDir, absolutePath);

      // Apply ignore filters
      let isIgnored = false;
      for (const [key, filter] of Object.entries(filters)) {
        if (filter && filter.ignores(relativePath)) {
          logger.verbose(`[${this.name}] Ignoring [${key}]: ${relativePath}`);
          isIgnored = true;
          break;
        }
      }
      if (isIgnored) continue;

      // TODO: Apply match patterns if provided in AdapterOptions

      logger.verbose(`[${this.name}] Processing: ${relativePath}`);
      includedCount++;
      let content: string | null = null;
      let itemType: ContentItem['type'] = 'text';
      let itemError: Error | undefined;
      let metadata: Record<string, any> = {};

      try {
        metadata = await getFileMetadata(absolutePath);
        const isBinary = await isBinaryFile(absolutePath);

        if (isBinary) {
          itemType = 'binary';
          // Maybe add file size or other metadata for binaries
          logger.verbose(
            `[${this.name}] Identified as binary: ${relativePath}`,
          );
        } else {
          itemType = 'text';
          content = await fs.readFile(absolutePath, 'utf-8');
        }
      } catch (error: any) {
        logger.warn(
          `[${this.name}] Error processing file ${relativePath}: ${error.message}`,
        );
        itemError = error; // Attach error to the item
      }

      yield {
        id: relativePath,
        source: inputDir,
        adapter: this.name,
        type: itemType,
        content: content,
        metadata: metadata,
        error: itemError,
      };
    }
    logger.info(
      `[${this.name}] Finished streaming. Included ${includedCount} files after filtering.`,
    );
  }
}

/**
 * Factory function to create a FileSystemAdapter instance.
 */
export function createFileSystemAdapter(): Adapter {
  return new FileSystemAdapter();
}
