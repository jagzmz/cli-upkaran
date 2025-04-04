import type { Command, Argument } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import {
  logger,
  type GlobalConfig,
  type CommandDefinition,
} from '@cli-upkaran/core';
import ora from 'ora';
import { constructCommandName } from './utils/index.js';

// Helper to dynamically build prompts based on command options
// This is complex and requires a good way to represent option types
async function promptForCommandOptions(command: Command): Promise<any> {
  const options: any = {};
  const commandOptions = command.options;

  logger.verbose(`Prompting for options of command: ${command.name()}`);
  p.intro(`Configure ${chalk.cyan(command.name())}: ${command.description()}`);

  for (const option of commandOptions) {
    const flags = option.flags; // e.g., '-o, --output <file>'
    const description = option.description;
    const defaultValue = option.defaultValue;
    const isBoolean =
      !option.flags.includes('<') && !option.flags.includes('[');
    const isRequired = option.required === false; // Note: Commander's .required doesn't always map perfectly to prompt requirement
    const name = option.attributeName(); // e.g., 'output'

    logger.verbose(`Prompting for option: ${name} (Flags: ${flags})`);

    if (isBoolean) {
      options[name] = await p.confirm({
        message: `${description}?`,
        initialValue: defaultValue ?? false,
      });
    } else {
      // Assume string input for others for now
      // More complex types (choices, numbers) would need more logic
      const value = await p.text({
        message: `${description}:`,
        placeholder: defaultValue ? `Default: ${defaultValue}` : 'Enter value',
        validate: (value) => {
          // Only require input if the option is required AND has NO default value
          if (isRequired && !value && defaultValue === undefined) {
             return 'Value is required!';
          }
        },
      });
      if (p.isCancel(value)) {
        process.exit(0);
      }
      options[name] = value || defaultValue; // Use default if empty and default exists
    }
  }
  // TODO: Handle command arguments as well

  return options;
}

// NEW Helper to prompt for command arguments
async function promptForCommandArguments(command: Command): Promise<string[]> {
  const args: string[] = [];
  // Use type assertion to access internal _args
  const argumentDefinitions = (command as any)._args as Argument[]; 

  logger.verbose(`Prompting for arguments of command: ${command.name()}`);
  
  if (argumentDefinitions && argumentDefinitions.length > 0) {
     p.intro(`Configure arguments for ${chalk.cyan(command.name())}`);
  }

  for (const argDef of argumentDefinitions) {
    // Argument names might be like '<url_or_sitemap_path>'
    const name = argDef.name(); 
    const description = argDef.description || `Value for ${name}`;

    // Check if argument is required (e.g., <arg> vs [arg])
    const isRequired = argDef.required;

    logger.verbose(`Prompting for argument: ${name} (Required: ${isRequired})`);

    const value = await p.text({
      message: `${description}:`,
      placeholder: isRequired ? 'Required' : 'Optional, press Enter to skip',
      validate: (value) => {
        if (isRequired && !value) return `${name} is required!`;
      },
    });

    if (p.isCancel(value)) {
       p.outro(chalk.yellow('Argument input cancelled.'));
       process.exit(0);
    }
    // Only add if value is provided (or if required, validation ensures it's provided)
    if (value) {
        args.push(value);
    } else if (isRequired) {
        // This case should ideally be caught by validation, but as a fallback:
        logger.error(`Required argument ${name} was not provided despite prompt.`);
        throw new Error(`Missing required argument: ${name}`);
    }
    // If optional and no value provided, we simply don't add it to args
  }
  return args;
}

/**
 * Runs the interactive mode using @clack/prompts.
 */
export async function runInteractive(
  program: Command, 
  config: GlobalConfig,
  availableCommands: CommandDefinition[]
) {
  p.intro(
    chalk(` ✨ ${chalk.bold('cli-upkaran Interactive Mode')} ✨ `)
  );

  if (availableCommands.length === 0) {
    p.log.warning('No commands available to run interactively.');
    return;
  }

  const selectedCommandName = await p.select({
    message: 'Which command would you like to run?',
    options: availableCommands.map((cmd) => {
      const packageName = cmd.packageName ?? 'unknown-package';
      const commandName = constructCommandName(packageName, cmd.name);
      return {
        value: commandName,
        label: commandName,
        hint: cmd.description,
      }
    }),
  });

  if (p.isCancel(selectedCommandName)) {
    p.outro(chalk.yellow('Interactive mode cancelled.'));
    process.exit(0);
  }

  const selectedCommand: Command = program.commands.find(
    (cmd) => cmd.name() === selectedCommandName,
  ) as Command;

  if (!selectedCommand) {
    logger.error(
      `Internal error: Could not find command instance for ${selectedCommandName}`,
    );
    p.outro(chalk.red('An internal error occurred.'));
    process.exit(1);
  }

  // --- Prompt for Arguments ---
  const collectedArguments = await promptForCommandArguments(selectedCommand);

  // --- Prompt for Options ---
  const commandOptions = await promptForCommandOptions(selectedCommand);

  // --- Confirmation ---
  p.log.step('Summary:');
  console.log(chalk.gray(` Command: ${chalk.cyan(selectedCommandName)}`));
  // Add Arguments to summary
  if (collectedArguments.length > 0) {
    console.log(chalk.gray(` Arguments: ${JSON.stringify(collectedArguments)}`));
  }
  console.log(chalk.gray(` Options: ${JSON.stringify(commandOptions)}`));

  const shouldProceed = await p.confirm({
    message: 'Run command with these settings?',
  });

  if (!shouldProceed || p.isCancel(shouldProceed)) {
    p.outro(chalk.yellow('Command execution cancelled.'));
    process.exit(0);
  }

  // --- Execution ---
  const spinner = ora(`Running ${selectedCommandName}...`).start();
  try {
    // Find the original definition from the list we already have
    const originalDefinition = availableCommands.find(
      (def) => constructCommandName(def.packageName!, def.name) === selectedCommandName,
    );
    if (originalDefinition?.handler) {
      // Set the collected arguments on the command instance before calling the handler
      selectedCommand.args = collectedArguments; 
      await originalDefinition.handler(commandOptions, selectedCommand); // Pass the updated command
      spinner.succeed(`${selectedCommandName} completed successfully.`);
    } else {
      // Fallback if handler wasn't reconstructed - this shouldn't happen ideally
      logger.error(
        `Could not find original handler for ${selectedCommandName} during interactive execution.`,
      );
      // Attempt to execute via program.parse, though this might re-prompt or fail
      // Construct args: node script.js commandName --opt val
      const args = [
        process.argv[0], // node executable
        process.argv[1], // script path
        selectedCommandName,
        ...Object.entries(commandOptions).flatMap(([key, value]) => {
          // Simplistic arg generation - needs refinement for flags, booleans etc.
          const option = selectedCommand.options.find(
            (o) => o.attributeName() === key,
          );
          if (!option) return [];
          const flag = option.long || option.short; // Prefer long flag
          if (typeof value === 'boolean') {
            return value ? [flag] : []; // Include flag only if true
          } else {
            return [flag, String(value)];
          }
        }),
      ];
      logger.warn(
        'Attempting execution via program.parse as fallback...',
        args,
      );
      await program.parseAsync(args as string[]);
      // Assume success if parseAsync doesn't throw catastrophically
      spinner.succeed(
        `${selectedCommandName} completed (via fallback execution).`,
      );
    }
  } catch (error: any) {
    spinner.fail(`${selectedCommandName} failed.`);
    logger.error(
      `Error during interactive execution of ${selectedCommandName}:`,
      error.message,
    );
    logger.verbose(error.stack);
    // Let the main error handler in index.ts catch and exit
    throw error;
  }

  p.outro(chalk.green('Done!'));
}
