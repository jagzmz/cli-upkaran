import micromatch from 'micromatch';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { logger } from '@ai-upkaran/core';
import ignore from 'ignore';
import type { Ignore } from 'ignore';

/**
 * Creates an ignore filter instance from a list of patterns.
 *
 * @param ignorePatterns - An array of gitignore-style patterns.
 * @param sourceDescription - A description of where the patterns came from (e.g., '.gitignore').
 * @returns An Ignore instance.
 */
export function createIgnoreFilter(
  ignorePatterns: string[],
  sourceDescription: string,
): Ignore {
  const ig = ignore.default();
  if (ignorePatterns.length > 0) {
    logger.verbose(
      `Adding ${ignorePatterns.length} ignore patterns from ${sourceDescription}:`,
    );
    ignorePatterns.forEach((pattern) => {
      // ignore() expects patterns relative to the base, trim leading slashes if present
      const cleanPattern = pattern.startsWith('/') ? pattern.slice(1) : pattern;
      if (cleanPattern) {
        ig.add(cleanPattern);
        logger.verbose(`  - ${cleanPattern}`);
      }
    });
  } else {
    logger.verbose(`No ignore patterns found from ${sourceDescription}.`);
  }
  return ig;
}

/**
 * Reads ignore patterns from a specified file path asynchronously.
 *
 * @param filePath - The absolute or relative path to the ignore file.
 * @returns A promise resolving to an array of non-empty, non-comment lines from the file.
 *          Returns an empty array if the file doesn't exist.
 * @throws Error if reading the file fails for reasons other than not existing.
 */
export async function readIgnoreFile(filePath: string): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    logger.verbose(`Read ignore file: ${filePath}`);
    return content
      .split(/\r?\n/) // Split by newline, handling Windows endings
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'));
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      logger.verbose(`Ignore file not found: ${filePath}`);
      return []; // File not found is not an error in this context
    } else {
      logger.error(`Error reading ignore file ${filePath}:`, error);
      throw error; // Re-throw other errors
    }
  }
}

/**
 * Combines multiple ignore filters and match patterns.
 * Returns a function that checks if a given path should be included.
 *
 * @param baseDir - The base directory against which paths and patterns are resolved.
 * @param filters - An object containing ignore instances (e.g., { default: Ignore, custom: Ignore, gitignore: Ignore }).
 * @param matchPatterns - Optional glob patterns to explicitly include paths.
 * @param excludePatterns - Optional glob patterns to explicitly exclude paths.
 * @returns A function `(relativePath: string) => boolean` which returns true if the path should be included.
 */
export function createInclusionChecker(
  baseDir: string,
  filters: Record<string, Ignore | undefined>,
  matchPatterns?: string | string[],
  excludePatterns?: string | string[],
): (relativePath: string) => boolean {
  const activeFilters = Object.entries(filters)
    .filter(([, ig]) => ig)
    .map(([key, ig]) => ({ key, ig: ig! }));
  const hasMatchPatterns = matchPatterns && matchPatterns.length > 0;
  const hasExcludePatterns = excludePatterns && excludePatterns.length > 0;

  logger.verbose('Creating inclusion checker with:');
  if (hasMatchPatterns)
    logger.verbose(` - Match patterns: ${JSON.stringify(matchPatterns)}`);
  if (hasExcludePatterns)
    logger.verbose(` - Exclude patterns: ${JSON.stringify(excludePatterns)}`);
  activeFilters.forEach((f) => logger.verbose(` - Ignore filter: ${f.key}`));

  return (relativePath: string): boolean => {
    const absolutePath = path.join(baseDir, relativePath);

    // 1. Check explicit exclude patterns first
    if (
      hasExcludePatterns &&
      micromatch.isMatch(relativePath, excludePatterns)
    ) {
      logger.verbose(`Path excluded by exclude pattern: ${relativePath}`);
      return false;
    }

    // 2. Check ignore filters
    for (const { key, ig } of activeFilters) {
      if (ig.ignores(relativePath)) {
        logger.verbose(`Path ignored by filter [${key}]: ${relativePath}`);
        return false;
      }
    }

    // 3. If match patterns are provided, the path MUST match them
    if (hasMatchPatterns) {
      const isMatched = micromatch.isMatch(relativePath, matchPatterns);
      if (!isMatched) {
        logger.verbose(`Path did not match required pattern: ${relativePath}`);
      }
      return isMatched; // Only include if it matches the required patterns
    }

    // 4. If no match patterns, include if not excluded or ignored
    return true;
  };
}
