// Using Command from commander as a placeholder type
// Replace with the actual type from the chosen CLI framework (commander or cac)
import type { Command } from 'commander';

export interface PluginConfig {
  name: string;
  path: string;
  options: Record<string, any>;
}

/**
 * Global configuration for cli-upkaran CLI
 */
export interface GlobalConfig {
  version: string;
  verbose: boolean;
  noColor: boolean;
  configPath?: string;
  plugins?: PluginConfig[];
}

/**
 * Interface for the object defining a single command.
 */
export interface CommandDefinition {
  /** The name used to invoke the command */
  name: string;
  /** A brief explanation shown in help messages */
  description: string;
  /** Optional aliases for the command */
  aliases?: string[];
  /** Optional package name from which this command originates */
  packageName?: string;
  /**
   * Function to configure command-specific options and arguments
   * using the CLI framework's command instance.
   */
  configure?: (command: Command) => void;
  /**
   * The async function that executes the command's logic.
   * Receives parsed options and potentially the command instance.
   */
  handler: (options: any, command: Command) => Promise<void>;
}

/**
 * Interface for the object returned by a plugin's registration function.
 * Defines the commands provided by the plugin.
 */
export interface CommandPlugin {
  /** Distinguishes this plugin type */
  type: 'command';
  /** An array of command definitions provided by this plugin */
  commands: CommandDefinition[];
  /** The name of the plugin */
  name: string;
}

/**
 * Represents a command plugin after its commands have been loaded.
 * Includes the original configuration and the loaded command definitions.
 */
export interface LoadedCommandPlugin extends PluginConfig {
  type: 'command';
  commands: CommandDefinition[];
}

/**
 * Type for the registration function that must be exported by a command plugin module.
 * It can optionally accept CLI options and returns one or more CommandPlugin objects.
 */
export type RegisterCommandsFn = (
  cliOptions?: any,
) => CommandPlugin | CommandPlugin[];
