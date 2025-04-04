import { Command, Argument, Option } from 'commander';
import {
  logger,
  getGlobalConfig,
  addPluginToGlobalConfig,
  removePluginFromGlobalConfig,
  findBrokenPlugins,
} from '@cli-upkaran/core';
import { createRequire } from 'node:module';
// import { exec } from 'node:child_process';
// import util from 'node:util';
// Import askConfirmation from utils
import { askConfirmation } from './utils/index.js';
// Import helpers from utils
import { installPluginGlobally } from './utils/index.js';

// Promisify exec for easier async/await usage
// const execPromise = util.promisify(exec);

// Helper to resolve modules relative to this file
const require = createRequire(import.meta.url);

export function registerPluginCommands(program: Command) {
  const pluginsCommand = program
    .command('plugins')
    .description('Manage locally registered command plugins');

  // plugins:list
  pluginsCommand
    .command('list')
    .alias('ls')
    .description('List registered plugins')
    .action(async () => {
      logger.info('Listing registered plugins:');
      try {
        const plugins = getGlobalConfig().plugins;
        if (plugins?.length === 0) {
          logger.info('(No plugins registered)');
        } else {
          plugins?.forEach((p) => console.log(p)); // Directly print for clean list
        }
      } catch (error) {
        logger.error('Failed to list plugins:', error);
      }
    });

  // plugins:add
  pluginsCommand
    .command('add')
    .description(
      'Register a new plugin package name or path (validates installation)',
    )
    .addArgument(
      new Argument(
        '<name_or_path_or_spec>',
        'Plugin package name[@version], or path to add',
      ),
    )
    .addOption(
      new Option(
        '--install',
        'Attempt to automatically install the plugin if not found',
      ).default(false),
    )
    .action(async (nameOrPathOrSpec: string, options: { install: boolean }) => {
      logger.info(`Attempting to add plugin: ${nameOrPathOrSpec}`);
      let resolvedPath: string | null = null;
      let packageName = nameOrPathOrSpec;
      let installSpec = nameOrPathOrSpec;

      // Check if it looks like a package specifier with version/tag
      const versionSeparatorIndex = nameOrPathOrSpec.lastIndexOf('@');
      if (versionSeparatorIndex > 0) {
        // Check if it's likely a scoped package or just a version/tag
        if (
          nameOrPathOrSpec.startsWith('@') &&
          nameOrPathOrSpec.indexOf('/') > 0 &&
          nameOrPathOrSpec.indexOf('/') < versionSeparatorIndex
        ) {
          // Scoped package like @scope/name@version
          packageName = nameOrPathOrSpec.substring(0, versionSeparatorIndex);
        } else if (!nameOrPathOrSpec.startsWith('@')) {
          // Regular package like name@version
          packageName = nameOrPathOrSpec.substring(0, versionSeparatorIndex);
        } else {
          // Could be just a scope @scope/name without version, treat as package name
          packageName = nameOrPathOrSpec;
          installSpec = nameOrPathOrSpec; // Install the name directly
        }
        logger.verbose(
          `Parsed spec: Name='${packageName}', InstallSpec='${installSpec}'`,
        );
      } else {
        // Assume it's a path or a package name without version
        packageName = nameOrPathOrSpec;
        installSpec = nameOrPathOrSpec;
      }

      try {
        // 1. Basic validation
        if (!nameOrPathOrSpec || typeof nameOrPathOrSpec !== 'string') {
          throw new Error('Invalid plugin name, path, or spec provided.');
        }

        // 2. Attempt to resolve using the parsed package name or path
        try {
          resolvedPath = require.resolve(packageName);
          logger.verbose(
            `Plugin '${packageName}' found locally at: ${resolvedPath}`,
          );
        } catch (resolveError: any) {
          if (resolveError.code === 'MODULE_NOT_FOUND') {
            logger.warn(`Plugin '${packageName}' not found locally.`);
            if (options.install) {
              // Use the potentially versioned spec for installation
              // AND pass the base name for verification
              const installSuccess = await installPluginGlobally(
                installSpec,
                packageName,
              );
              if (!installSuccess) {
                logger.error(
                  `Failed to automatically install '${installSpec}'. Exiting.`,
                );
                return; // Stop if installation failed
              }
              // Now try to resolve again using the BASE package name
              try {
                resolvedPath = require.resolve(packageName);
                logger.verbose(
                  `Plugin '${packageName}' resolved after install: ${resolvedPath}`,
                );
              } catch (postInstallResolveError) {
                logger.error(
                  `Failed to resolve '${packageName}' after successful installation. Check package contents.`,
                  postInstallResolveError,
                );
                return;
              }
            } else {
              logger.error(
                `Plugin '${packageName}' not found and --install flag not provided.`,
              );
              logger.warn(
                `Please install it (e.g., \`npm install -g ${installSpec}\`) or use --install.`,
              );
              return; // Stop processing
            }
          } else {
            throw resolveError; // Re-throw other resolution errors
          }
        }

        // Should have a resolved path here if successful
        if (!resolvedPath) {
          logger.error(
            `Failed to resolve plugin '${packageName}' even after attempting install.`,
          );
          return;
        }

        // 3. Add to registry
        const added = await addPluginToGlobalConfig({
          name: packageName,
          path: resolvedPath,
          options: {},
        });
        if (!added) {
          logger.warn(`Plugin '${packageName}' is already registered.`);
        }
      } catch (error) {
        logger.error(`Failed to add plugin '${nameOrPathOrSpec}':`, error);
      }
    });

  // plugins:remove
  pluginsCommand
    .command('remove')
    .alias('rm')
    .description('Unregister a plugin package name or path')
    .addArgument(
      new Argument('<name_or_path>', 'Plugin package name or path to remove'),
    )
    .action(async (nameOrPath: string) => {
      logger.info(`Attempting to remove plugin: ${nameOrPath}`);
      try {
        if (!nameOrPath || typeof nameOrPath !== 'string') {
          throw new Error('Invalid plugin name or path provided.');
        }
        const removed = await removePluginFromGlobalConfig(nameOrPath);
        if (!removed) {
          logger.warn(`Plugin '${nameOrPath}' was not found in the registry.`);
        }
      } catch (error) {
        logger.error(`Failed to remove plugin '${nameOrPath}':`, error);
      }
    });

  // plugins:cleanup
  pluginsCommand
    .command('cleanup')
    .description(
      'Find and optionally remove registered plugins that cannot be resolved',
    )
    .action(async () => {
      logger.info('Checking registry for broken plugins...');
      try {
        const brokenPlugins = await findBrokenPlugins();

        if (brokenPlugins.length === 0) {
          logger.success('Registry check complete. No broken plugins found.');
          return;
        }

        logger.warn(
          `Found ${brokenPlugins.length} potentially broken plugin(s):`,
        );
        brokenPlugins.forEach((p) => {
          console.log(`  - Name: ${p.name}, Registered Path: ${p.path}`);
        });

        const confirmed = await askConfirmation(
          'Do you want to remove these plugins from the registry?',
        );

        if (confirmed) {
          logger.info('Removing broken plugins...');
          let removedCount = 0;
          for (const plugin of brokenPlugins) {
            const removed = await removePluginFromGlobalConfig(plugin.name);
            if (removed) {
              removedCount++;
            }
          }
          logger.success(
            `Cleanup complete. Removed ${removedCount} plugin(s) from the registry.`,
          );
        } else {
          logger.info('Cleanup aborted. No changes made to the registry.');
        }
      } catch (error) {
        logger.error('Failed during plugin cleanup:', error);
      }
    });
}
