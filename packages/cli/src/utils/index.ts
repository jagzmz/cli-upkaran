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
  packageName: string,
): Promise<boolean> {
  logger.info(`Attempting to install '${packageName}' globally via npm...`);
  try {
    const installCommand = `npm install -g ${packageName}`;
    logger.verbose(`Executing: ${installCommand}`);
    const { stderr } = await execPromise(installCommand);
    if (stderr) {
      // Often npm install -g shows warnings on stderr even on success
      logger.warn(
        `Installation output (stderr) for ${packageName}:\n${stderr}`,
      );
    }
    // Consider stdout less critical unless debugging
    // logger.verbose(`Installation output (stdout) for ${packageName}:\n${stdout}`);
    logger.success(`Installation command for '${packageName}' finished.`);
    // Verify installation by resolving again
    if (checkLocalPlugin(packageName)) {
      logger.success(`Successfully installed and verified '${packageName}'.`);
      return true;
    } else {
      logger.error(
        `Installation command ran for '${packageName}', but package still not resolvable.`,
      );
      return false;
    }
  } catch (installError: any) {
    logger.error(
      `Failed to automatically install '${packageName}':`,
      installError.message || installError,
    );
    return false;
  }
}

// Add other shared CLI utility functions here if needed
