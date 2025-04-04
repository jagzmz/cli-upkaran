#!/usr/bin/env node

import { Command, Option } from 'commander';
import { registerAllCommands } from './commands.js';
import { registerPluginCommands } from './commands-plugins.js';
import { runInteractive } from './interactive.js';
import {
  logger,
  loadGlobalConfig,
  setVerbose,
  AiUpkaranError,
  type GlobalConfig,
  type CommandDefinition,
  addPluginToGlobalConfig,
} from '@cli-upkaran/core';
import { createRequire } from 'node:module';
import { exec } from 'node:child_process';
import util from 'node:util';
import readline from 'node:readline/promises';
// Import helpers from utils
import {
    askConfirmation,
    checkLocalPlugin,
    checkNpmAvailability,
    installPluginGlobally,
} from './utils/index.js';

// Helper require (can be used for local resolution checks)
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

async function main() {
  const program = new Command();

  program
    .name('cli-upkaran')
    .version(packageJson.version)
    .description(packageJson.description)
    // Global options
    .addOption(
      new Option('--verbose', 'Enable detailed logging output').default(false),
    )
    .addOption(
      new Option('--no-color', 'Disable colored output').default(false),
    )
    // Collect multiple plugin options into an array
    .option(
      '--plugin <path_or_name>',
      'Load specific command plugin(s) (overrides registry)',
      (value, previous: string[] = []) => previous.concat(value),
      [] // Ensure default is an empty array
    );
  // TODO: Add --config option

  // Parse global options early to set up logger and config
  // Use parseOptions to avoid executing default command/help
  program.parseOptions(process.argv);
  let globalOpts = program.opts(); // Use let as we might modify globalOpts.plugin

  // --- Pre-check and Install Logic for --plugin --- 
  if (globalOpts.plugin && globalOpts.plugin.length > 0) {
    logger.verbose('Validating plugins provided via --plugin...');
    const validatedPlugins: string[] = [];
    for (const requestedPlugin of globalOpts.plugin) {
      let resolvedPath = checkLocalPlugin(requestedPlugin);
      if (resolvedPath) {
        logger.verbose(`Plugin '${requestedPlugin}' found locally.`);
        validatedPlugins.push(requestedPlugin); // Keep it in the list
        continue; // Already available
      }

      logger.warn(`Plugin '${requestedPlugin}' not found locally.`);
      const isAvailableOnNpm = await checkNpmAvailability(requestedPlugin);

      if (!isAvailableOnNpm) {
        logger.error(`Plugin '${requestedPlugin}' not found locally or on npm registry.`);
        process.exit(1); // Exit if explicitly requested plugin is unavailable
      }

      const installConfirmed = await askConfirmation(
        `Plugin '${requestedPlugin}' is available on npm. Install it globally?`
      );

      if (!installConfirmed) {
        logger.warn('Installation declined. Exiting.');
        process.exit(1); // Exit if user declines install for requested plugin
      }

      const installSuccess = await installPluginGlobally(requestedPlugin);
      if (!installSuccess) {
        logger.error(`Failed to install '${requestedPlugin}'. Exiting.`);
        process.exit(1); // Exit if install fails
      }

      // After successful install, resolve again and add to registry
      resolvedPath = checkLocalPlugin(requestedPlugin);
      if (!resolvedPath) {
         logger.error(`Failed to resolve '${requestedPlugin}' after installation. Exiting.`);
         process.exit(1);
      }

      logger.info(`Registering newly installed plugin '${requestedPlugin}'...`);
      await addPluginToGlobalConfig({
          name: requestedPlugin,
          path: resolvedPath,
          options: {}
      });
      // Keep it in the list for this run
      validatedPlugins.push(requestedPlugin);
    }
    // Update globalOpts to only contain validated/installed plugins for this run
    globalOpts.plugin = validatedPlugins;
    logger.verbose(`Proceeding with validated --plugin list: ${validatedPlugins.join(', ')}`);
  }
  // --- End Pre-check --- 

  // Load configuration (passing initial CLI args)
  const config: GlobalConfig = await loadGlobalConfig(globalOpts);

  // Apply global settings from the final config
  setVerbose(config.verbose ?? false);
  // Chalk instance in core logger should handle NO_COLOR / --no-color via config/env

  logger.verbose('cli-upkaran CLI starting...');
  logger.verbose(`Version: ${packageJson.version}`);
  logger.verbose('Global config loaded:', config);
  logger.verbose('Raw CLI arguments:', process.argv);
  logger.verbose('Parsed global options:', globalOpts);

  // Register plugin management commands
  registerPluginCommands(program);

  // Register built-in and plugin commands, passing the loaded config
  const allCommandDefinitions: CommandDefinition[] = await registerAllCommands(
    program,
    config,
  );

  // Decide whether to run interactive mode or parse a specific command
  const commandArgs = process.argv.slice(2);
  const firstArg = commandArgs[0];
  const isHelp = firstArg === '-h' || firstArg === '--help';
  const isVersion = firstArg === '-V' || firstArg === '--version';
  // Check if any known command name is present *after* parsing global options
  const knownCommands = program.commands
    .map((cmd) => cmd.name())
    .concat(program.commands.flatMap((cmd) => cmd.aliases()));
  // Check if any command-line argument explicitly matches a known command name or alias
  const commandProvided = commandArgs.some((arg) => knownCommands.includes(arg));

  const isInteractiveTrigger = !commandProvided && !isHelp && !isVersion;

  if (isInteractiveTrigger) {
    logger.verbose(
      'No command specified or only global options provided, entering interactive mode...',
    );
    await runInteractive(program, config, allCommandDefinitions);
  } else {
    // Let commander handle the command parsing and execution
    await program.parseAsync(process.argv);
  }

  logger.verbose('cli-upkaran CLI finished.');
}

main().catch((err) => {
  if (err instanceof AiUpkaranError) {
    logger.error(err.message);
    if (err.cause instanceof Error) {
      logger.error('Caused by:', err.cause.message);
      logger.verbose('Underlying error stack:', err.cause.stack);
    }
  } else if (err instanceof Error) {
    logger.error('An unexpected error occurred:', err.message);
    logger.verbose(err.stack);
  } else {
    logger.error('An unexpected error occurred:', err);
  }
  process.exit(1);
});
