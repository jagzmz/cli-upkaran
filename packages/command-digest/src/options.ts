import type { Command } from 'commander';
import { Option } from 'commander'; // Import Option

// Define the structure of options specific to the digest command
export interface DigestOptions {
  output: string;
  format: 'markdown' | 'json'; // Allow specific formats
  // match?: string | string[]; // Define if needed, adapter might handle it
  ignore?: string[];
  ignoreFile?: string;
  useGitignore: boolean;
  defaultIgnores: boolean; // Note: Commander expects positive flag name
  whitespaceRemoval: boolean;
  showOutputFiles: boolean;
  // transform?: string[]; // For future transformer plugins
  // plugins?: string[]; // For future dataprep plugins
  // Add other specific options here
}

/**
 * Configures the Commander command instance with options specific to 'digest'.
 */
export function configureDigestOptions(command: Command) {
  command
    .addOption(
      new Option('-o, --output <file>', 'Output file path').default(
        'codebase.md',
      ),
    )
    .addOption(
      new Option('--format <format>', 'Output format')
        .choices(['markdown', 'json'])
        .default('markdown'),
    )
    // .option('-m, --match <patterns...>', 'Glob patterns to include files') // Handled by adapter
    .option(
      '--ignore <patterns...>',
      'Glob patterns to ignore (overrides .gitignore, etc.)',
    )
    .option(
      '--ignore-file <file>',
      'Custom ignore file path',
      '.ai-upkaran-ignore',
    ) // Example custom name
    .addOption(
      new Option('--use-gitignore', 'Apply rules from .gitignore file').default(
        true,
      ),
    )
    // For boolean flags, commander uses --no-<flag> to negate. Default is true means flag is present by default.
    // Option name should be positive: `defaultIgnores`. Commander implicitly creates `--no-default-ignores`.
    .addOption(
      new Option(
        '--default-ignores',
        'Apply built-in default ignore patterns',
      ).default(true),
    )
    .addOption(
      new Option(
        '--whitespace-removal',
        'Remove excess whitespace (preserves in sensitive files)',
      ).default(false),
    )
    .addOption(
      new Option(
        '--show-output-files',
        'Display a list of files included in the output',
      ).default(false),
    );
  // .option('--transform <names...>', 'Apply specific content transformations')
  // .option('--plugin <paths...>', 'Load data preparation plugins (adapters, transformers, formatters)');
}
