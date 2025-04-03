import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { logger } from './logger.js'; // Use .js extension for ESM compatibility
import type { CommandPlugin, RegisterCommandsFn } from './types.js'; // Use .js extension

const require = createRequire(import.meta.url);

/**
 * Dynamically loads command plugins.
 *
 * @param pluginPathsOrNames - An array of plugin package names or paths to plugin modules.
 * @returns A promise resolving to an array of loaded CommandPlugin objects.
 */
export async function loadCommandPlugins(
  pluginPathsOrNames: string[],
): Promise<CommandPlugin[]> {
  const loadedPlugins: CommandPlugin[] = [];
  logger.verbose(
    `Attempting to load plugins: ${pluginPathsOrNames.join(', ')}`,
  );

  for (const nameOrPath of pluginPathsOrNames) {
    try {
      // Attempt to resolve the plugin path/name
      // Use require.resolve to handle both file paths and package names
      const resolvedPath = require.resolve(nameOrPath);
      logger.verbose(`Resolved plugin path: ${resolvedPath}`);

      // Dynamically import the module - use fileURLToPath for Windows compatibility if needed
      // For simplicity, assuming POSIX paths for now, but fileURLToPath is safer cross-platform
      const pluginModule = await import(resolvedPath);
      logger.verbose(`Successfully imported module: ${nameOrPath}`);

      // Check for the registration function (e.g., registerCommands)
      if (
        pluginModule.registerCommands &&
        typeof pluginModule.registerCommands === 'function'
      ) {
        const registrationFn =
          pluginModule.registerCommands as RegisterCommandsFn;
        // TODO: Pass relevant CLI options if needed by the plugin
        const registrationResult = registrationFn();
        logger.verbose(`Called registerCommands for ${nameOrPath}`);

        const pluginsToAdd = Array.isArray(registrationResult)
          ? registrationResult
          : [registrationResult];

        // Validate and add the commands
        pluginsToAdd.forEach((plugin) => {
          if (plugin && plugin.type === 'command' && plugin.commands) {
            // Add the package name to each command definition
            const commandsWithPackageName = plugin.commands.map((cmd) => ({
              ...cmd,
              packageName: nameOrPath, // Add the plugin name/path
            }));
            loadedPlugins.push({ ...plugin, commands: commandsWithPackageName });
            logger.success(`Loaded command plugin from: ${nameOrPath}`);
          } else {
            logger.warn(
              `Invalid plugin structure returned by registerCommands in ${nameOrPath}. Skipping.`,
            );
          }
        });
      } else {
        logger.warn(
          `Plugin module ${nameOrPath} does not export a 'registerCommands' function. Skipping.`,
        );
      }
    } catch (error) {
      logger.error(`Failed to load plugin from ${nameOrPath}:`, error);
      // Optionally re-throw or continue loading others
    }
  }

  logger.info(
    `Finished loading plugins. Total command plugins loaded: ${loadedPlugins.length}`,
  );
  return loadedPlugins;
}
