#!/usr/bin/env node

import { Command, Option } from 'commander';
import { registerAllCommands } from './commands.js';
import { runInteractive } from './interactive.js';
import {
  logger,
  loadGlobalConfig,
  setVerbose,
  AiUpkaranError,
  type GlobalConfig,
  type CommandDefinition,
} from '@ai-upkaran/core';
import { createRequire } from 'node:module';

// Helper to read package.json
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

async function main() {
  const program = new Command();

  program
    .name('ai-upkaran')
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
      'Load a command plugin (can be specified multiple times)',
      (value, previous: string[] = []) => previous.concat(value),
    );
  // TODO: Add --config option

  // Parse global options early to set up logger and config
  // Use parseOptions to avoid executing default command/help
  program.parseOptions(process.argv);
  const globalOpts = program.opts();

  // Load configuration (passing initial CLI args)
  const config: GlobalConfig = await loadGlobalConfig(globalOpts);

  // Apply global settings from the final config
  setVerbose(config.verbose ?? false);
  // Chalk instance in core logger should handle NO_COLOR / --no-color via config/env

  logger.verbose('ai-upkaran CLI starting...');
  logger.verbose(`Version: ${packageJson.version}`);
  logger.verbose('Global config loaded:', config);
  logger.verbose('Raw CLI arguments:', process.argv);
  logger.verbose('Parsed global options:', globalOpts);

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
  const commandProvided = commandArgs.some(
    (arg) =>
      knownCommands.includes(arg) ||
      program.commands.some(
        (cmd) => cmd.args.includes(arg) && !arg.startsWith('-'),
      ),
  );

  const isInteractiveTrigger = !commandProvided && !isHelp && !isVersion;

  if (isInteractiveTrigger) {
    logger.info(
      'No command specified or only global options provided, entering interactive mode...',
    );
    await runInteractive(program, config, allCommandDefinitions);
  } else {
    // Let commander handle the command parsing and execution
    await program.parseAsync(process.argv);
  }

  logger.verbose('ai-upkaran CLI finished.');
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
