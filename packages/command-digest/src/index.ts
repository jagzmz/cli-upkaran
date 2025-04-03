import type { Command } from 'commander';
import type { CommandDefinition } from '@ai-upkaran/core';
import { runDigest } from './digest.js';
import { configureDigestOptions, type DigestOptions } from './options.js';
import path from 'node:path';

const digestCommandDefinition: CommandDefinition = {
  name: 'digest',
  description:
    'Aggregates and processes local files into a single output, suitable for AI context.',
  aliases: ['d'],
  configure: configureDigestOptions,
  handler: async (options: DigestOptions, command: Command) => {
    // First argument is the input directory (optional)
    const inputArg = command.args[0];
    const inputDir = inputArg ? path.resolve(inputArg) : process.cwd();
    // Output file is relative to cwd unless it's absolute
    const outputFile = path.isAbsolute(options.output)
      ? options.output
      : path.resolve(process.cwd(), options.output);

    await runDigest(inputDir, outputFile, options);
  },
};

// This is the registration function the CLI will call
export function registerCommands() {
  // Or match the type expected by plugin loader
  // Could return CommandPlugin object if needed by loader
  return {
    type: 'command',
    commands: [digestCommandDefinition],
  };
}

// --- Direct Registration Approach (Alternative, used by cli/commands.ts currently) ---
// If the CLI directly imports and calls a registration function per command:

/**
 * Registers the digest command with the main program.
 * (This approach might be simpler if commands don't need complex plugin lifecycle).
 */
export function registerDigestCommand(program: Command) {
  const cmd = program.command(digestCommandDefinition.name);
  cmd.description(digestCommandDefinition.description);
  cmd.aliases(digestCommandDefinition.aliases ?? []);
  // Add argument definition here, as configure might just add options
  cmd.argument(
    '[input_directory]',
    'Input directory path (defaults to current directory)',
  );

  if (digestCommandDefinition.configure) {
    digestCommandDefinition.configure(cmd);
  }
  cmd.action(digestCommandDefinition.handler);
}
