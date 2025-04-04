import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { logger } from './logger.js'; // Use .js extension for ESM compatibility
import type {
  PluginConfig,
  LoadedCommandPlugin,
  CommandDefinition,
  CommandPlugin, // The structure returned by registerCommands
} from './types.js';

// Helper to get the require function relative to this module
// This is still useful for require.resolve
const require = createRequire(import.meta.url);

/**
 * Dynamically loads command plugins based on the provided configurations.
 *
 * @param pluginConfigs - An array of plugin configurations (name, path, options).
 * @returns A promise resolving to an array of successfully loaded command plugin definitions.
 */
export async function loadCommandPlugins(
  pluginConfigs: PluginConfig[],
): Promise<LoadedCommandPlugin[]> {
  const loadedPlugins: LoadedCommandPlugin[] = [];
  logger.verbose(
    `Attempting to load ${pluginConfigs.length} plugin configurations...`,
  );

  for (const config of pluginConfigs) {
    const { name: pluginName, path: pluginPath, options: pluginOptions } = config;
    let resolvedPath: string;
    let modulePathToImport: string;

    try {
      // Resolve the plugin path: Absolute paths and package names are handled directly.
      // Relative paths need to be resolved relative to the CWD.
      if (path.isAbsolute(pluginPath) || !pluginPath.match(/^\.\.?[\\\/]/)) {
        // Absolute path or potential package name
        resolvedPath = require.resolve(pluginPath);
        logger.verbose(`Resolved plugin '${pluginName}' (package/absolute) to: ${resolvedPath}`);
      } else {
        // Relative path - resolve relative to the current working directory
        resolvedPath = path.resolve(process.cwd(), pluginPath);
        logger.verbose(`Resolved plugin '${pluginName}' (relative) to CWD: ${resolvedPath}`);
      }

      // Determine the path for dynamic import (may need file:// URL)
      // Simple approach for now, might need refinement for edge cases/Windows
      modulePathToImport = resolvedPath;
      // Consider using pathToFileURL if imports fail on Windows
      // modulePathToImport = pathToFileURL(resolvedPath).href;

      // Dynamically import the module
      const pluginModule = await import(modulePathToImport);
      logger.verbose(`Successfully imported module: ${pluginName} from ${modulePathToImport}`);

      // Check for the registration function (e.g., registerCommands)
      if (
        pluginModule.registerCommands &&
        typeof pluginModule.registerCommands === 'function'
      ) {
        // Assuming registerCommands returns CommandPlugin | CommandPlugin[]
        const registrationResult: CommandPlugin | CommandPlugin[] =
          pluginModule.registerCommands();
        logger.verbose(`Called registerCommands for ${pluginName}`);

        const pluginsPartsToAdd = Array.isArray(registrationResult)
          ? registrationResult
          : [registrationResult];

        pluginsPartsToAdd.forEach((pluginDefPart) => {
          if (pluginDefPart?.type === 'command' && pluginDefPart.commands) {
            // Explicitly type cmd parameter
            const commandsWithPackageName = pluginDefPart.commands.map(
              (cmd: CommandDefinition) => ({
                ...cmd,
                packageName: pluginName, // Use name from original config
              }),
            );

            // Construct the LoadedCommandPlugin object
            const loadedPlugin: LoadedCommandPlugin = {
              ...config, // Spread original config (name, path, options)
              type: 'command', // Add type from loaded part
              commands: commandsWithPackageName, // Add processed commands
            };
            loadedPlugins.push(loadedPlugin);
            logger.verbose(`Processed command plugin: ${pluginName}`);
          } else {
            logger.warn(
              `Invalid plugin structure returned by registerCommands in ${pluginName}. Skipping part.`,
            );
          }
        });
      } else {
        logger.warn(
          `Plugin module ${pluginName} does not export a 'registerCommands' function. Skipping.`,
        );
      }
    } catch (error) {
      logger.error(`Failed to load plugin '${pluginName}' from path '${pluginPath}':`, error);
      // Optionally re-throw or continue loading others
    }
  }

  logger.verbose(
    `Finished processing plugins. Total command plugins loaded: ${loadedPlugins.length}`,
  );
  return loadedPlugins;
}
