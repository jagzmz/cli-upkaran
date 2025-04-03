import { logger } from './logger.js';
import type { GlobalConfig } from './types.js';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';

// Default configuration
const defaultConfig: Partial<GlobalConfig> = {
  verbose: false,
  noColor: false,
  pluginPaths: [],
};

// Central registry file path
const registryDir = path.join(os.homedir(), '.config', 'cli-upkaran');
const registryPath = path.join(registryDir, 'plugins.json');

let currentConfig: GlobalConfig = { ...defaultConfig } as GlobalConfig; // Initialize with defaults

/**
 * Reads the plugin registry file.
 * Returns an array of plugin names/paths or an empty array if not found or invalid.
 */
async function readPluginRegistry(): Promise<string[]> {
  try {
    const content = await fs.readFile(registryPath, 'utf-8');
    const plugins = JSON.parse(content);
    if (Array.isArray(plugins) && plugins.every((p) => typeof p === 'string')) {
      logger.verbose(`Read ${plugins.length} plugins from registry: ${registryPath}`);
      return plugins;
    }
    logger.warn(`Invalid format found in registry file: ${registryPath}. Ignoring.`);
    return [];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      logger.verbose(`Plugin registry file not found: ${registryPath}`);
    } else {
      logger.error(`Error reading plugin registry file ${registryPath}:`, error);
    }
    return [];
  }
}

/**
 * Gets the list of plugins currently stored in the registry.
 */
export async function getRegisteredPlugins(): Promise<string[]> {
    return await readPluginRegistry();
}

/**
 * Adds a plugin to the registry file, avoiding duplicates.
 * Returns true if the plugin was added, false if it already existed.
 */
export async function addPluginToRegistry(pluginName: string): Promise<boolean> {
    const currentPlugins = await readPluginRegistry();
    if (currentPlugins.includes(pluginName)) {
        logger.verbose(`Plugin '${pluginName}' already exists in registry.`);
        return false; // Already exists
    }
    const updatedPlugins = [...currentPlugins, pluginName].sort(); // Keep sorted
    await writePluginRegistry(updatedPlugins);
    logger.info(`Plugin '${pluginName}' added to registry.`);
    return true;
}

/**
 * Removes a plugin from the registry file.
 * Returns true if the plugin was removed, false if it wasn't found.
 */
export async function removePluginFromRegistry(pluginName: string): Promise<boolean> {
    const currentPlugins = await readPluginRegistry();
    if (!currentPlugins.includes(pluginName)) {
        logger.verbose(`Plugin '${pluginName}' not found in registry.`);
        return false; // Not found
    }
    const updatedPlugins = currentPlugins.filter(p => p !== pluginName);
    await writePluginRegistry(updatedPlugins);
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

  // 2. Read plugins from the central registry
  const registryPlugins = await readPluginRegistry();

  // 3. Combine sources, giving precedence: CLI > Registry > Defaults
  const cliPlugins = cliArgs.plugin ?? [];
  const combinedPlugins = [...new Set([...registryPlugins, ...cliPlugins])]; // Use Set for deduplication

  mergedConfig = {
    ...mergedConfig,
    verbose: cliArgs.verbose ?? process.env.AI_UPKARAN_VERBOSE === '1' ?? mergedConfig.verbose,
    noColor: cliArgs.noColor ?? process.env.NO_COLOR === '1' ?? mergedConfig.noColor,
    pluginPaths: combinedPlugins, // Use combined list
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
export async function writePluginRegistry(plugins: string[]): Promise<void> {
    await ensureConfigDirExists(); // Make sure directory exists first
    try {
        const content = JSON.stringify(plugins, null, 2); // Pretty-print JSON
        await fs.writeFile(registryPath, content, 'utf-8');
        logger.verbose(`Wrote ${plugins.length} plugins to registry: ${registryPath}`);
    } catch (error) {
        logger.error(`Error writing plugin registry file ${registryPath}:`, error);
        throw error; // Let caller handle
    }
}
