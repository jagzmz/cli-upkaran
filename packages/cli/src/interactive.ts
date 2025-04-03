import type { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import {
  logger,
  type GlobalConfig,
  type CommandDefinition,
} from '@ai-upkaran/core';
import ora from 'ora';

// Helper function to get available commands from the program
function getAvailableCommands(program: Command): CommandDefinition[] {
  // This is a simplification. It assumes commands were registered with
  // the necessary details accessible or reconstructible.
  // A more robust approach might involve storing CommandDefinition objects during registration.
  return program.commands.map((cmd) => ({
    name: cmd.name(),
    description: cmd.description(),
    aliases: cmd.aliases(),
    // We might not have the original configure/handler here easily
    // For interactive mode, we might need a different way to get option details
    configure: (c: Command) => {
      logger.warn(
        `Interactive mode cannot fully reconstruct configure for ${c.name()}`,
      );
    },
    handler: async () => {
      logger.error(
        `Cannot execute command ${cmd.name()} solely from interactive reconstruction.`,
      );
    },
  })) as any;
}

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
    const isRequired = option.required; // Note: Commander's .required doesn't always map perfectly to prompt requirement
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
          // Basic required check - might need more robust validation
          if (isRequired && !value) return 'Value is required!';
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

/**
 * Runs the interactive mode using @clack/prompts.
 */
export async function runInteractive(program: Command, config: GlobalConfig) {
  p.intro(chalk.inverse(` ${chalk.bold('ai-upkaran Interactive Mode')} `));

  const availableCommands = getAvailableCommands(program);

  if (availableCommands.length === 0) {
    p.log.warning('No commands available to run interactively.');
    return;
  }

  const selectedCommandName = await p.select({
    message: 'Which command would you like to run?',
    options: availableCommands.map((cmd) => ({
      value: cmd.name,
      label: cmd.name,
      hint: cmd.description,
    })),
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

  // --- Prompt for options --- S
  const commandOptions = await promptForCommandOptions(selectedCommand);

  // --- Confirmation --- S
  p.log.step('Summary:');
  console.log(chalk.gray(` Command: ${chalk.cyan(selectedCommandName)}`));
  console.log(chalk.gray(` Options: ${JSON.stringify(commandOptions)}`));

  const shouldProceed = await p.confirm({
    message: 'Run command with these settings?',
  });

  if (!shouldProceed || p.isCancel(shouldProceed)) {
    p.outro(chalk.yellow('Command execution cancelled.'));
    process.exit(0);
  }

  // --- Execution --- S
  const spinner = ora(`Running ${selectedCommandName}...`).start();
  try {
    // Find the original handler to execute
    // This relies on the handler being correctly attached during registration
    const originalDefinition = availableCommands.find(
      (def) => def.name === selectedCommandName,
    );
    if (originalDefinition?.handler) {
      await originalDefinition.handler(commandOptions, selectedCommand as any);
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
