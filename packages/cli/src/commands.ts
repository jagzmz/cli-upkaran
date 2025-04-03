import type { Command } from 'commander';
import {
  logger,
  loadCommandPlugins,
  type CommandPlugin,
  type CommandDefinition,
  type GlobalConfig,
} from '@ai-upkaran/core';

// --- Import built-in command registration functions --- S
// These imports will likely cause dependency cycles if commands depend on CLI UI.
// Consider a different registration pattern if needed, e.g., commands register themselves.
import { registerDigestCommand } from '@ai-upkaran/command-digest';

/**
 * Helper function to add a CommandDefinition to the main Commander program.
 * Returns the definition that was added.
 */
function addCommandToProgram(program: Command, def: CommandDefinition): CommandDefinition {
  const cmd = program.command(def.name);
  if (def.description) cmd.description(def.description);
  if (def.aliases) cmd.aliases(def.aliases);

  // Allow the command definition to configure its own arguments and options
  if (def.configure) {
    logger.verbose(`Configuring options/args for command: ${def.name}`);
    // Type cast to handle the version mismatch between commander types
    def.configure(cmd as any);
  }

  // Set the action handler for the command
  cmd.action(async (...args: any[]) => {
    // Commander passes options object as the last argument, and the command instance before it.
    const options = args[args.length - 2];
    const commandInstance = args[args.length - 1];
    logger.verbose(`Executing command: ${def.name}`);
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
  logger.info('Registering commands...');
  const registeredDefinitions: CommandDefinition[] = [];

  // 1. Register built-in commands (Placeholder - uncomment when command packages exist)
  logger.verbose('Registering built-in commands...');
  // registerDigestCommand(program); // Example
  // --- Add calls to register other built-in commands here ---
  // logger.warn('Built-in command registration is currently commented out.');

  // 2. Discover and register plugin commands
  const pluginPaths = config.pluginPaths || [];
  if (pluginPaths.length > 0) {
    logger.verbose(
      `Attempting to load command plugins from: ${pluginPaths.join(', ')}`,
    );
    const loadedPlugins: CommandPlugin[] =
      await loadCommandPlugins(pluginPaths);

    loadedPlugins.forEach((plugin) => {
      if (plugin.type === 'command' && plugin.commands) {
        logger.info(`Registering commands from plugin...`); // TODO: identify plugin source
        plugin.commands.forEach((cmdDef: CommandDefinition) => {
          logger.verbose(`Registering command: ${cmdDef.name}`);
          const registeredDef = addCommandToProgram(program, cmdDef);
          registeredDefinitions.push(registeredDef);
        });
      }
    });
  } else {
    logger.verbose('No external command plugins specified to load.');
  }

  logger.info('Command registration complete.');
  return registeredDefinitions; // Return the collected definitions
}
