import { Command, Argument, Option } from 'commander';
import {
  logger,
  getGlobalConfig,
  addPluginToGlobalConfig,
  removePluginFromGlobalConfig,
  findBrokenPlugins,
} from '@cli-upkaran/core';
import { createRequire } from 'node:module';
import { exec } from 'node:child_process';
import util from 'node:util';
// Import askConfirmation from utils
import { askConfirmation } from './utils/index.js';

// Promisify exec for easier async/await usage
const execPromise = util.promisify(exec);

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
      new Argument('<name_or_path>', 'Plugin package name or path to add'),
    )
    .addOption(
      new Option(
        '--install',
        'Attempt to automatically install the plugin if not found',
      ).default(false),
    )
    .action(async (nameOrPath: string, options: { install: boolean }) => {
      logger.info(`Attempting to add plugin: ${nameOrPath}`);
      let resolvedPath: string | null = null;

      try {
        // 1. Basic validation
        if (!nameOrPath || typeof nameOrPath !== 'string') {
          throw new Error('Invalid plugin name or path provided.');
        }

        // 2. Attempt to resolve
        try {
          resolvedPath = require.resolve(nameOrPath);
          logger.verbose(`Plugin found locally at: ${resolvedPath}`);
        } catch (resolveError: any) {
          if (resolveError.code === 'MODULE_NOT_FOUND') {
            logger.warn(`Plugin '${nameOrPath}' not found locally.`);
            if (options.install) {
              logger.info(
                `Attempting to install '${nameOrPath}' globally via npm...`,
              );
              try {
                const installCommand = `npm install -g ${nameOrPath}`;
                logger.verbose(`Executing: ${installCommand}`);
                const { stderr } = await execPromise(installCommand);
                if (stderr) {
                  logger.warn(
                    `Installation warnings for ${nameOrPath}:\n${stderr}`,
                  );
                }
                logger.success(`Successfully installed '${nameOrPath}'.`);
                // Now try to resolve again after installation
                resolvedPath = require.resolve(nameOrPath);
                logger.verbose(
                  `Plugin resolved after install: ${resolvedPath}`,
                );
              } catch (installError: any) {
                logger.error(
                  `Failed to automatically install '${nameOrPath}':`,
                  installError.message || installError,
                );
                return; // Stop if installation failed
              }
            } else {
              logger.error('Plugin not found and --install flag not provided.');
              logger.warn(
                `Please install it (e.g., \`npm install -g ${nameOrPath}\`) or use --install.`,
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
            `Failed to resolve plugin '${nameOrPath}' even after attempting install.`,
          );
          return;
        }

        // 3. Add to registry using the original name and the *resolved* path
        const added = await addPluginToGlobalConfig({
          name: nameOrPath, // Keep the name user provided (could be package name or local relative path)
          path: resolvedPath, // Store the absolute path we know works
          options: {},
        });
        if (!added) {
          logger.warn(`Plugin '${nameOrPath}' is already registered.`);
        }
      } catch (error) {
        logger.error(`Failed to add plugin '${nameOrPath}':`, error);
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
            // Log even if removal failed (shouldn't happen if findBrokenPlugins was accurate)
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
