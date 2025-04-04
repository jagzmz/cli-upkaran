import { createRequire } from 'node:module';
import { exec } from 'node:child_process';
import util from 'node:util';
import readline from 'node:readline/promises';
import { logger } from '@cli-upkaran/core'; // Import logger

// Helper require for internal resolution checks
const require = createRequire(import.meta.url);
const execPromise = util.promisify(exec);

export function constructCommandName(
  packageName?: string,
  commandName?: string,
) {
  packageName = packageName ?? 'unknown-package';
  return `${packageName}:${commandName}`;
}

/**
 * Asks the user for confirmation.
 */
export async function askConfirmation(query: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(`${query} (yes/no): `);
  rl.close();
  return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
}

/**
 * Checks if a plugin is locally resolvable.
 * Returns the resolved path or null.
 */
export function checkLocalPlugin(nameOrPath: string): string | null {
  try {
    // Use internal require helper
    return require.resolve(nameOrPath);
  } catch (e: any) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    logger.warn(`Unexpected error resolving '${nameOrPath}' locally:`, e);
    return null; // Treat unexpected errors as unresolvable for safety
    // throw e; // Or re-throw if that behavior is preferred
  }
}

/**
 * Checks if a package name is available on the npm registry.
 */
export async function checkNpmAvailability(
  packageName: string,
): Promise<boolean> {
  logger.verbose(`Checking npm availability for: ${packageName}`);
  try {
    await execPromise(`npm view ${packageName} version --json`); // Use --json for quieter output
    logger.verbose(`Package '${packageName}' found on npm.`);
    return true;
  } catch (e) {
    logger.verbose(`Package '${packageName}' not found on npm. Error: ${e}`);
    return false; // Assumes error means not found
  }
}

/**
 * Installs a package globally using npm.
 * Returns true on success, false on failure.
 */
export async function installPluginGlobally(
  installSpec: string, // e.g., name@version
  baseName: string, // e.g., name
): Promise<boolean> {
  logger.info(`Attempting to install '${installSpec}' globally via npm...`);
  try {
    const installCommand = `npm install -g ${installSpec}`;
    logger.verbose(`Executing: ${installCommand}`);
    const { stderr } = await execPromise(installCommand);
    if (stderr) {
      logger.warn(
        `Installation output (stderr) for ${installSpec}:\n${stderr}`,
      );
    }
    logger.success(`Installation command for '${installSpec}' finished.`);

    // Verify installation by resolving the BASE NAME again
    if (checkLocalPlugin(baseName)) {
      logger.success(`Successfully installed and verified '${baseName}'.`);
      return true;
    } else {
      // This error is more accurate now
      logger.error(
        `Installation command ran for '${installSpec}', but base package '${baseName}' still not resolvable.`,
      );
      return false;
    }
  } catch (installError: any) {
    logger.error(
      `Failed to automatically install '${installSpec}':`,
      installError.message || installError,
    );
    return false;
  }
}

// Add other shared CLI utility functions here if needed
