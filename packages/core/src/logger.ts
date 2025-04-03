import chalk, { Chalk } from 'chalk';

// Basic logger implementation. Can be enhanced later with levels, transports, etc.

// Determine if color should be disabled (e.g., via NO_COLOR env var or --no-color flag)
// This is a simplified check; a more robust check might involve process.stdout.isTTY
const noColor =
  process.env.NO_COLOR === '1' || process.argv.includes('--no-color');
// Use new chalk.Chalk({ level: ... }) for v5+
const chalkInstance = new Chalk({ level: noColor ? 0 : undefined });

let isVerbose = process.argv.includes('--verbose');

export function setVerbose(verbose: boolean) {
  isVerbose = verbose;
}

export const logger = {
  /** Log informational messages. */
  info: (...args: any[]) => {
    console.log(chalkInstance.blue('INFO:'), ...args);
  },

  /** Log success messages. */
  success: (...args: any[]) => {
    console.log(chalkInstance.green('SUCCESS:'), ...args);
  },

  /** Log warning messages. */
  warn: (...args: any[]) => {
    console.warn(chalkInstance.yellow('WARN:'), ...args);
  },

  /** Log error messages. */
  error: (...args: any[]) => {
    console.error(chalkInstance.red('ERROR:'), ...args);
  },

  /** Log verbose messages, only shown if verbose mode is enabled. */
  verbose: (...args: any[]) => {
    if (isVerbose) {
      console.log(chalkInstance.gray('VERBOSE:'), ...args);
    }
  },
};
