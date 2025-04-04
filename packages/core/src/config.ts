import { logger } from './logger.js';
import type { GlobalConfig, PluginConfig } from './types.js';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

export const CONFIG_VERSION = '1';

// Helper require for internal resolution checks
const internalRequire = createRequire(import.meta.url);

// Default configuration
const defaultConfig: GlobalConfig = {
  version: CONFIG_VERSION,
  verbose: false,
  noColor: false,
  plugins: [],
};

// Central registry file path
const registryDir = path.join(os.homedir(), '.config', 'cli-upkaran');
const registryPath = path.join(registryDir, 'plugins.json');

let currentConfig: GlobalConfig = { ...defaultConfig } as GlobalConfig; // Initialize with defaults

/**
 * Reads the global config file.
 */
async function readGlobalConfig(): Promise<GlobalConfig> {
  try {
    const content = await fs.readFile(registryPath, 'utf-8');
    const config = JSON.parse(content) as GlobalConfig;
    if (config.version !== CONFIG_VERSION) {
      logger.warn(
        `Invalid format found in registry file: ${registryPath}. Ignoring.`,
      );
      return { ...defaultConfig, plugins: [] };
    }
    return config;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      logger.verbose(`Global config file not found: ${registryPath}`);
    } else {
      logger.error(`Error reading global config file ${registryPath}:`, error);
    }
    return { ...defaultConfig, plugins: [] };
  }
}

/**
 * Adds a plugin to the global config file, avoiding duplicates.
 * Returns true if the plugin was added, false if it already existed.
 */
export async function addPluginToGlobalConfig(
  pluginConfig: PluginConfig,
): Promise<boolean> {
  const currentConfig = await readGlobalConfig();
  if (currentConfig.plugins?.some((p) => p.name === pluginConfig.name)) {
    logger.verbose(`Plugin '${pluginConfig.name}' already exists in registry.`);
    return false; // Already exists
  }
  const existingPlugins = currentConfig.plugins ?? [];
  existingPlugins.push(pluginConfig);
  await writePluginConfig({ ...currentConfig, plugins: existingPlugins });
  logger.info(`Plugin '${pluginConfig.name}' added to registry.`);
  return true;
}

/**
 * Removes a plugin from the global config file.
 * Returns true if the plugin was removed, false if it wasn't found.
 */
export async function removePluginFromGlobalConfig(
  pluginName: string,
): Promise<boolean> {
  const currentConfig = await readGlobalConfig();
  if (!currentConfig.plugins?.some((p) => p.name === pluginName)) {
    logger.verbose(`Plugin '${pluginName}' not found in registry.`);
    return false; // Not found
  }
  const updatedPlugins = currentConfig.plugins?.filter(
    (p) => p.name !== pluginName,
  );
  await writePluginConfig({ ...currentConfig, plugins: updatedPlugins });
  logger.info(`Plugin '${pluginName}' removed from registry.`);
  return true;
}

/**
 * Loads global configuration by merging defaults, registry, and CLI arguments.
 */
export async function loadGlobalConfig(
  cliArgs: any = {},
): Promise<GlobalConfig> {
  logger.verbose('Loading global configuration...');

  // 1. Start with defaults
  let mergedConfig: GlobalConfig = { ...defaultConfig } as GlobalConfig;

  // TODO: Implement actual config file loading (e.g., .cli-upkaranrc) here
  // This would be another source to merge, likely before CLI args

  // 2. Determine plugin source: CLI args override registry
  const cliPlugins: string[] | undefined = cliArgs.plugin;
  let finalPlugins: PluginConfig[] = [];

  if (cliPlugins && cliPlugins.length > 0) {
    logger.verbose(
      `Loading plugins exclusively from --plugin CLI arguments: ${cliPlugins.join(', ')}`,
    );
    // Use only plugins from CLI args
    finalPlugins = cliPlugins.map((p) => ({
      name: p, // Use the provided string as name
      path: p, // Use the provided string as path (resolution happens later)
      options: {}, // Start with empty options
    }));
  } else {
    logger.verbose('Loading plugins from central registry...');
    // Load plugins from the registry file
    const registryConfig = await readGlobalConfig();
    finalPlugins = registryConfig.plugins ?? [];
  }

  // 3. Construct final configuration
  mergedConfig = {
    ...mergedConfig,
    // Merge non-plugin config from registry if necessary (or handle via step TODO above)
    verbose:
      cliArgs.verbose ??
      process.env.AI_UPKARAN_VERBOSE === '1' ?? // TODO: Update env var name if needed
      mergedConfig.verbose,
    noColor:
      cliArgs.noColor ?? process.env.NO_COLOR === '1' ?? mergedConfig.noColor,
    plugins: finalPlugins, // Assign the determined list of plugins
    // configPath: cliArgs.config ?? mergedConfig.configPath // Add if --config is implemented
  };

  currentConfig = mergedConfig;
  logger.verbose('Global configuration loaded:', currentConfig);
  return currentConfig;
}

/**
 * Gets the currently loaded global configuration.
 */
export function getGlobalConfig(): GlobalConfig {
  return currentConfig;
}

/**
 * Ensures the configuration directory exists.
 */
export async function ensureConfigDirExists(): Promise<void> {
  try {
    await fs.mkdir(registryDir, { recursive: true });
    logger.verbose(`Ensured config directory exists: ${registryDir}`);
  } catch (error) {
    logger.error(`Failed to create config directory ${registryDir}:`, error);
    throw error; // Re-throw? Or handle more gracefully?
  }
}

/**
 * Writes the given list of plugins to the registry file.
 */
export async function writePluginConfig(config: GlobalConfig): Promise<void> {
  await ensureConfigDirExists(); // Make sure directory exists first
  try {
    const content = JSON.stringify(config, null, 2); // Pretty-print JSON
    await fs.writeFile(registryPath, content, 'utf-8');
    logger.verbose(`Wrote config: ${registryPath}`);
  } catch (error) {
    logger.error(`Error writing config file ${registryPath}:`, error);
    throw error; // Let caller handle
  }
}

/**
 * Attempts to resolve a plugin's path, checking both name and path fields.
 * Logs details verbosely.
 * Returns the resolved absolute path if successful, null otherwise.
 */
function resolveSinglePlugin(config: PluginConfig): string | null {
  const { name, path: registeredPath } = config;
  try {
    // Try name first
    const resolvedByName = internalRequire.resolve(name);
    logger.verbose(
      `  [OK] Plugin '${name}' resolved by name to: ${resolvedByName}`,
    );
    return resolvedByName;
  } catch (nameError: any) {
    if (nameError.code !== 'MODULE_NOT_FOUND') {
      logger.warn(
        `  [Warn] Unexpected error resolving '${name}' by name:`,
        nameError,
      );
    } else {
      logger.verbose(
        `  [Info] Could not resolve '${name}' by name. Trying path '${registeredPath}'.`,
      );
    }
    // Fall through to try path
  }

  try {
    // Try registered path (handling relative/absolute/package)
    let resolvedByPath: string;
    if (
      path.isAbsolute(registeredPath) ||
      !registeredPath.match(/^\.\.?[\\\/]/)
    ) {
      resolvedByPath = internalRequire.resolve(registeredPath);
      logger.verbose(
        `  [OK] Plugin '${name}' resolved by path (abs/pkg) '${registeredPath}' to: ${resolvedByPath}`,
      );
    } else {
      resolvedByPath = path.resolve(process.cwd(), registeredPath);
      internalRequire.resolve(resolvedByPath); // Check existence
      logger.verbose(
        `  [OK] Plugin '${name}' resolved by path (rel) '${registeredPath}' to CWD: ${resolvedByPath}`,
      );
    }
    return resolvedByPath;
  } catch (pathError: any) {
    if (pathError.code !== 'MODULE_NOT_FOUND') {
      logger.warn(
        `  [Warn] Unexpected error resolving '${name}' by path '${registeredPath}':`,
        pathError,
      );
    }
    logger.verbose(
      `  [Fail] Could not resolve plugin '${name}' by path '${registeredPath}'.`,
    );
    return null;
  }
}

/**
 * Validates the plugins listed in the global config, identifying unresolvable ones.
 * Returns an array of PluginConfig objects for the plugins that could NOT be resolved.
 */
export async function findBrokenPlugins(): Promise<PluginConfig[]> {
  const config = await readGlobalConfig();
  const registeredPlugins = config.plugins ?? [];
  const brokenPlugins: PluginConfig[] = [];

  logger.verbose(
    `Validating ${registeredPlugins.length} registered plugins...`,
  );
  for (const plugin of registeredPlugins) {
    const resolvedPath = resolveSinglePlugin(plugin);
    if (!resolvedPath) {
      brokenPlugins.push(plugin);
    }
  }
  logger.verbose(
    `Validation complete. Found ${brokenPlugins.length} potentially broken plugins.`,
  );
  return brokenPlugins;
}
