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

// Helper require
const require = createRequire(import.meta.url);

/**
 * Attempts to resolve a plugin path, prioritizing name resolution.
 * Returns the resolved path or null if resolution fails.
 */
function tryResolvePluginPath(config: PluginConfig): string | null {
  const { name, path: registeredPath } = config;
  let resolvedPath: string | null = null;

  // 1. Try resolving by name first (most robust for installed packages)
  try {
    resolvedPath = require.resolve(name);
    logger.verbose(`Resolved plugin '${name}' by name to: ${resolvedPath}`);
    return resolvedPath;
  } catch (nameError: any) {
    if (nameError.code !== 'MODULE_NOT_FOUND') {
      logger.warn(
        `Unexpected error resolving plugin '${name}' by name:`,
        nameError,
      );
      // Continue to try resolving by path
    } else {
      logger.verbose(
        `Could not resolve plugin '${name}' by name. Trying registered path '${registeredPath}'...`,
      );
    }
  }

  // 2. If name resolution failed, try resolving by the registered path
  try {
    if (
      path.isAbsolute(registeredPath) ||
      !registeredPath.match(/^\.\.?[\\\/]/)
    ) {
      // Absolute path or potential package name (might be same as name, but try again)
      resolvedPath = require.resolve(registeredPath);
      logger.verbose(
        `Resolved plugin '${name}' (path: package/absolute) to: ${resolvedPath}`,
      );
    } else {
      // Relative path - resolve relative to CWD
      resolvedPath = path.resolve(process.cwd(), registeredPath);
      // Check if relative path resolution actually finds the file before claiming success
      require.resolve(resolvedPath); // This will throw if the resolved path doesn't exist
      logger.verbose(
        `Resolved plugin '${name}' (path: relative) to CWD: ${resolvedPath}`,
      );
    }
    return resolvedPath;
  } catch (pathError: any) {
    if (pathError.code !== 'MODULE_NOT_FOUND') {
      logger.warn(
        `Unexpected error resolving plugin '${name}' by path '${registeredPath}':`,
        pathError,
      );
    }
    // If path resolution also fails, return null
    return null;
  }
}

/**
 * Dynamically loads command plugins based on the provided configurations.
 * Skips plugins that cannot be resolved or loaded, logging errors.
 */
export async function loadCommandPlugins(
  pluginConfigs: PluginConfig[],
): Promise<LoadedCommandPlugin[]> {
  const loadedPlugins: LoadedCommandPlugin[] = [];
  logger.verbose(
    `Attempting to load ${pluginConfigs.length} plugin configurations...`,
  );

  for (const config of pluginConfigs) {
    const { name: pluginName } = config;
    let modulePathToImport: string | null = null;

    try {
      // Attempt to resolve the plugin path
      modulePathToImport = tryResolvePluginPath(config);

      if (!modulePathToImport) {
        logger.error(
          `Failed to resolve plugin '${pluginName}'. Check name and path ('${config.path}'). Skipping.`,
        );
        continue; // Skip to the next plugin
      }

      // Dynamically import the module
      // Use try-catch specifically around import and execution
      const pluginModule = await import(modulePathToImport);
      logger.verbose(
        `Successfully imported module: ${pluginName} from ${modulePathToImport}`,
      );

      // Check for the registration function
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
            const commandsWithPackageName = pluginDefPart.commands.map(
              (cmd: CommandDefinition) => ({
                ...cmd,
                packageName: pluginName,
              }),
            );
            const loadedPlugin: LoadedCommandPlugin = {
              ...config,
              type: 'command',
              commands: commandsWithPackageName,
            };
            loadedPlugins.push(loadedPlugin);
            logger.verbose(`Processed command plugin: ${pluginName}`);
          } else {
            logger.warn(
              `Invalid structure from registerCommands in ${pluginName}. Skipping part.`,
            );
          }
        });
      } else {
        logger.warn(
          `Plugin module ${pluginName} does not export 'registerCommands'. Skipping.`,
        );
      }
    } catch (loadError) {
      // Catch errors during import or execution for *this specific plugin*
      logger.error(
        `Failed to load or execute plugin '${pluginName}' from ${modulePathToImport || config.path}:`,
        loadError,
      );
      // Continue to the next plugin
    }
  }

  logger.info(
    `Finished processing plugins. Successfully loaded: ${loadedPlugins.length}/${pluginConfigs.length}`,
  );
  return loadedPlugins;
}
