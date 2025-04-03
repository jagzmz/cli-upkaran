import { promises as fs, Stats } from 'node:fs';
import path from 'node:path';
import { logger } from '@cli-upkaran/core';

/**
 * Gets basic file metadata.
 *
 * @param filePath - Absolute path to the file.
 * @returns An object containing metadata like size, created/modified times.
 */
export async function getFileMetadata(
  filePath: string,
): Promise<Record<string, any>> {
  try {
    const stats: Stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtimeMs,
      modified: stats.mtimeMs,
      accessed: stats.atimeMs,
      filePath: filePath, // Include full path for reference
      fileName: path.basename(filePath),
      fileExt: path.extname(filePath),
    };
  } catch (error: any) {
    logger.warn(
      `[fs-adapter-utils] Could not get metadata for ${filePath}: ${error.message}`,
    );
    return {
      filePath: filePath,
      error: `Failed to stat file: ${error.message}`,
    };
  }
}

// Add other filesystem-specific utility functions here if needed
