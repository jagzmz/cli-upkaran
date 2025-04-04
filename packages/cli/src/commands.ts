import type { Command } from 'commander';
import {
  logger,
  loadCommandPlugins,
  type CommandDefinition,
  type GlobalConfig,
  type PluginConfig,
  type LoadedCommandPlugin,
} from '@cli-upkaran/core';
import Table from 'cli-table3';

import { constructCommandName } from './utils/index.js';

/**
 * Helper function to add a CommandDefinition to the main Commander program.
 * Returns the definition that was added.
 */
function addCommandToProgram(
  program: Command,
  def: CommandDefinition,
): CommandDefinition {
  const commandName = constructCommandName(def.packageName!, def.name);
  const cmd = program.command(commandName);
  if (def.description) cmd.description(def.description);
  if (def.aliases) cmd.aliases(def.aliases);

  // Allow the command definition to configure its own arguments and options
  if (def.configure) {
    logger.verbose(`Configuring options/args for command: ${commandName}`);
    // Type cast to handle the version mismatch between commander types
    def.configure(cmd as any);
  }

  // Set the action handler for the command
  cmd.action(async (...args: any[]) => {
    // Commander passes options object as the last argument, and the command instance before it.
    const options = args[args.length - 2];
    const commandInstance = args[args.length - 1];
    logger.verbose(`Executing command: ${commandName}`);
    logger.verbose(`With options: ${JSON.stringify(options)}`);
    // Call the handler defined in the CommandDefinition
    await def.handler(options, commandInstance);
  });

  return def; // Return the definition
}

/**
 * Registers all commands (built-in and plugins) with the Commander program.
 * Returns an array of the registered CommandDefinitions.
 */
export async function registerAllCommands(
  program: Command,
  config: GlobalConfig,
): Promise<CommandDefinition[]> {
  logger.verbose('Registering commands...');
  const registeredDefinitions: CommandDefinition[] = [];

  // 1. Register built-in commands (Placeholder - uncomment when command packages exist)
  logger.verbose('Registering built-in commands...');
  // registerDigestCommand(program); // Example
  // --- Add calls to register other built-in commands here ---
  // logger.warn('Built-in command registration is currently commented out.');

  // 2. Discover and register plugin commands
  const pluginConfigs: PluginConfig[] = config.plugins || [];
  if (pluginConfigs.length > 0) {
    logger.verbose(
      `Attempting to load command plugins from: ${pluginConfigs.map((p) => p.name).join(', ')}`,
    );
    const loadedPlugins: LoadedCommandPlugin[] =
      await loadCommandPlugins(pluginConfigs);

    const pluginTree: Record<string, any> = {};
    loadedPlugins.forEach((plugin) => {
      if (plugin.type === 'command' && plugin.commands) {
        plugin.commands.forEach((cmdDef: CommandDefinition, index: number) => {
          const commandName = constructCommandName(
            cmdDef.packageName!,
            cmdDef.name,
          );
          const registeredDef = addCommandToProgram(program, cmdDef);
          registeredDefinitions.push(registeredDef);
          pluginTree[cmdDef.packageName!] ??= [];
          pluginTree[cmdDef.packageName!].push(cmdDef.name);
        });
      }
    });
    const table = new Table({
      head: ['Plugin', 'Commands'],
      style: {
        head: ['green'],
      },
    });
    for (const plugin in pluginTree) {
      table.push([plugin, pluginTree[plugin].join(', ')]);
    }
    logger.verbose(`Plugin tree: \n${table.toString()}`);
  } else {
    logger.verbose('No external command plugins specified to load.');
  }

  logger.verbose('Command registration complete.');
  return registeredDefinitions; // Return the collected definitions
}
