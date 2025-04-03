import { logger } from './logger.js';
import type { GlobalConfig } from './types.js';

// Placeholder for configuration loading logic.
// This could involve reading from files (e.g., .ai-upkaranrc), environment variables,
// or merging different config sources.

let currentConfig: GlobalConfig = {
  verbose: false,
  noColor: false,
};

/**
 * Loads global configuration.
 * (Currently a stub - returns default empty config)
 */
export async function loadGlobalConfig(
  cliArgs: any = {},
): Promise<GlobalConfig> {
  logger.verbose('Loading global configuration...');

  // TODO: Implement actual config loading logic
  // - Read from standard config file locations
  // - Read from path specified by --config flag
  // - Read environment variables (e.g., AI_UPKARAN_VERBOSE)
  // - Merge sources, giving precedence (e.g., CLI args > env vars > file)

  const loadedConfig: GlobalConfig = {
    verbose: cliArgs.verbose ?? process.env.AI_UPKARAN_VERBOSE === '1' ?? false,
    noColor: cliArgs.noColor ?? process.env.NO_COLOR === '1' ?? false,
    pluginPaths: cliArgs.plugin ?? [], // Get from --plugin flag
    // ... other defaults ...
  };

  currentConfig = loadedConfig;
  logger.verbose('Global configuration loaded:', currentConfig);
  return currentConfig;
}

/**
 * Gets the currently loaded global configuration.
 */
export function getGlobalConfig(): GlobalConfig {
  return currentConfig;
}
