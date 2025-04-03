import { Command, Argument, Option } from 'commander';
import {
    logger,
    getRegisteredPlugins,
    addPluginToRegistry,
    removePluginFromRegistry,
} from '@cli-upkaran/core';
import { createRequire } from 'node:module';
import { exec } from 'node:child_process';
import util from 'node:util';

// Promisify exec for easier async/await usage
const execPromise = util.promisify(exec);

// Helper to resolve modules relative to this file
const require = createRequire(import.meta.url);

export function registerPluginCommands(program: Command) {
    const pluginsCommand = program.command('plugins')
        .description('Manage locally registered command plugins');

    // plugins:list
    pluginsCommand
        .command('list')
        .alias('ls')
        .description('List registered plugins')
        .action(async () => {
            logger.info('Listing registered plugins:');
            try {
                const plugins = await getRegisteredPlugins();
                if (plugins.length === 0) {
                    logger.info('(No plugins registered)');
                } else {
                    plugins.forEach(p => console.log(p)); // Directly print for clean list
                }
            } catch (error) {
                logger.error('Failed to list plugins:', error);
            }
        });

    // plugins:add
    pluginsCommand
        .command('add')
        .description('Register a new plugin package name or path (validates installation)')
        .addArgument(new Argument('<name_or_path>', 'Plugin package name or path to add'))
        .addOption(new Option('--install', 'Attempt to automatically install the plugin if not found').default(false))
        .action(async (nameOrPath: string, options: { install: boolean }) => {
            logger.info(`Attempting to add plugin: ${nameOrPath}`);
            try {
                // 1. Basic validation
                if (!nameOrPath || typeof nameOrPath !== 'string') {
                    throw new Error('Invalid plugin name or path provided.');
                }

                // 2. Check if plugin is resolvable/installed
                try {
                    const resolvedPath = require.resolve(nameOrPath);
                    logger.verbose(`Plugin resolved successfully at: ${resolvedPath}`);
                } catch (resolveError: any) {
                    if (resolveError.code === 'MODULE_NOT_FOUND') {
                        logger.error(`Plugin '${nameOrPath}' could not be found.`);

                        // Attempt installation only if --install flag is present
                        if (options.install) {
                            logger.info(`Attempting to install '${nameOrPath}' globally via npm...`);
                            try {
                                const installCommand = `npm install -g ${nameOrPath}`;
                                logger.verbose(`Executing: ${installCommand}`);
                                const { stdout, stderr } = await execPromise(installCommand);
                                if (stderr) {
                                    logger.warn(`Installation warnings for ${nameOrPath}:
${stderr}`);
                                }
                                logger.success(`Successfully installed '${nameOrPath}'.
${stdout}`);
                                // Now proceed to add it to the registry after successful install
                            } catch (installError: any) {
                                logger.error(`Failed to automatically install '${nameOrPath}':`, installError.message || installError);
                                if (installError.stderr) {
                                    logger.error(`Installation stderr:
${installError.stderr}`);
                                }
                                logger.warn('Please try installing it manually and then run add again.');
                                return; // Stop if installation failed
                            }
                        } else {
                            // If --install was not used, suggest manual installation
                            logger.warn(`Please ensure it is installed (e.g., run \`npm install -g ${nameOrPath}\`) or provide a correct path.`);
                            logger.warn(`Alternatively, run this command again with the --install flag to attempt automatic installation.`);
                            return; // Stop processing if not resolvable and not installing
                        }
                    } else {
                        // Handle other resolution errors
                        logger.error(`Error trying to resolve plugin '${nameOrPath}':`, resolveError);
                        return; // Stop processing on other resolution errors
                    }
                }

                // 3. Add to registry (only happens if resolved initially or installed successfully)
                const added = await addPluginToRegistry(nameOrPath);
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
        .addArgument(new Argument('<name_or_path>', 'Plugin package name or path to remove'))
        .action(async (nameOrPath: string) => {
            logger.info(`Attempting to remove plugin: ${nameOrPath}`);
            try {
                if (!nameOrPath || typeof nameOrPath !== 'string') {
                    throw new Error('Invalid plugin name or path provided.');
                }
                const removed = await removePluginFromRegistry(nameOrPath);
                if (!removed) {
                    logger.warn(`Plugin '${nameOrPath}' was not found in the registry.`);
                }
            } catch (error) {
                logger.error(`Failed to remove plugin '${nameOrPath}':`, error);
            }
        });
} 