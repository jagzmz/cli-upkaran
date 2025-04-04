# cli-upkaran: The AI Toolkit CLI

<!-- Add badges here (e.g., Build Status, npm version, License) -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`cli-upkaran` (meaning AI Tools/Instruments in Hindi) is a modular and extensible command-line interface designed to streamline AI development workflows. It provides a core foundation and allows extending its capabilities through a simple plugin system.

## Features

*   **Modular Architecture:** Built with a core engine and separate plugin packages for specific commands.
*   **Extensible via Plugins:** Easily add new commands and functionalities by installing or creating plugins.
*   **Central Plugin Registry:** Manage plugins effortlessly using built-in commands (`plugins list`, `add`, `remove`). Plugins are stored locally in `~/.config/cli-upkaran/plugins.json`.
*   **Automatic Plugin Loading:** Loads all registered plugins automatically on startup.
*   **Optional Auto-Installation:** The `plugins add` command can attempt to automatically install missing plugins from npm using the `--install` flag.
*   **Namespace Resolution:** Prevents command name collisions between plugins by using qualified names (`<packageName>:<commandName>`).
*   **Interactive Mode:** Provides an interactive prompt for discovering and running commands if no specific command is provided.
*   **Global Options:** Control verbosity (`--verbose`) and color output (`--no-color`).

## Installation

**Prerequisites:**
*   Node.js (LTS version recommended)
*   npm (usually comes with Node.js)

Install the CLI globally using npm:

```bash
npm install -g cli-upkaran 
# Note: Adjust if the final published package name is different (e.g., @cli-upkaran/cli)
```

This will make the `cli-upkaran` command available in your terminal.

## Usage

### Running Commands

Execute commands directly using their name. If the command comes from a plugin, use its fully qualified name:

```bash
# Example: Run a built-in or uniquely named command
cli-upkaran some-command --option value

# Example: Run a command from a specific plugin package
cli-upkaran @my-plugin/command-pack:do-something --input data.json

# Example: Get help for a specific command
cli-upkaran <commandName> --help
cli-upkaran <packageName>:<commandName> --help
```

### Interactive Mode

If you run `cli-upkaran` without specifying a command, it will enter interactive mode (if implemented), allowing you to select and run available commands from a list.

```bash
cli-upkaran
```

### Global Options

These options can be used with any command:

*   `--verbose`: Enable detailed logging output for debugging.
*   `--no-color`: Disable colored output in the terminal.
*   `--plugin <path_or_name>`: Temporarily load a specific plugin for this execution only. Can be specified multiple times. This is useful for testing local plugins without registering them globally.

## Plugin Management

`cli-upkaran` uses a central registry (`~/.config/cli-upkaran/plugins.json`) to keep track of your installed plugins. You manage this registry using the `cli-upkaran plugins` commands.

**1. Listing Registered Plugins:**

```bash
cli-upkaran plugins list
# Alias: cli-upkaran plugins ls 
```
This shows all plugin package names or paths currently stored in your registry file.

**2. Adding / Registering a Plugin:**

```bash
# Add a plugin (checks if it's installed first)
cli-upkaran plugins add <plugin-package-name>

# Add a plugin and attempt to install it globally if not found
cli-upkaran plugins add <plugin-package-name> --install

# Add a plugin from a local path (useful for development)
cli-upkaran plugins add /path/to/my/local-plugin-package 
```
The `add` command first verifies if the plugin package name or path can be resolved (i.e., if it's installed or the path exists). 
*   If it's not found, it will prompt you to install it manually (e.g., `npm install -g <plugin-package-name>`) or suggest using the `--install` flag.
*   If the `--install` flag is provided and the plugin is not found, it will attempt to run `npm install -g <plugin-package-name>` for you.
*   Only resolvable/successfully installed plugins are added to the registry.

**3. Removing / Unregistering a Plugin:**

```bash
cli-upkaran plugins remove <plugin-package-name>
# Alias: cli-upkaran plugins rm <plugin-package-name>
```
This removes the specified plugin package name or path from your registry file. It does *not* uninstall the package itself from your system.

## Developing Plugins (High-Level Overview)

Creating your own commands for `cli-upkaran` involves creating a Node.js package that exports a specific registration function.

1.  **Create a Package:** Set up a standard Node.js package with a `package.json`.
2.  **Add Dependencies:** Add `@cli-upkaran/core` as a dependency to access necessary types and utilities.
3.  **Implement Commands:**
    *   Define your command logic within functions.
    *   Create command definitions conforming to the `CommandDefinition` interface from `@cli-upkaran/core`. Specify `name`, `description`, optional `aliases`, `configure` (for options/args using Commander.js), and the async `handler` function.
4.  **Export `registerCommands`:** Your package's main entry point must export a function named `registerCommands`. This function takes no arguments (currently) and should return a `CommandPlugin` object or an array of `CommandPlugin` objects.
    ```typescript
    // Example plugin entry point (e.g., index.ts)
    import type { Command } from \'commander\'; // Or your specific CLI framework type
    import type { CommandDefinition, CommandPlugin, RegisterCommandsFn } from \'@cli-upkaran/core\';

    const myCommandHandler = async (options: any, command: Command): Promise<void> => {
      console.log(\'My command executed with options:\', options);
      // Command logic here...
    };

    const myCommandDef: CommandDefinition = {
      name: \'my-command\',
      description: \'Does something amazing\',
      // configure: (cmd) => { /* Add options/args here */ },
      handler: myCommandHandler,
    };

    export const registerCommands: RegisterCommandsFn = () => {
      return {
        type: \'command\',
        commands: [myCommandDef],
      };
    };
    ```
5.  **Testing Locally:** You can test your local plugin without registering it globally using:
    ```bash
    cli-upkaran --plugin /path/to/your/local-plugin your-plugin-pack:my-command
    ```
    Or, register the local path:
    ```bash
    cli-upkaran plugins add /path/to/your/local-plugin
    cli-upkaran your-local-plugin:my-command 
    ```

*Refer to the `@cli-upkaran/digest` or `@cli-upkaran/fetch` packages within this repository for concrete examples.*

## Contributing

Contributions are welcome! Please refer to the `CONTRIBUTING.md` file (if it exists) for guidelines.

<!-- 
Potential future sections:
- Configuration File (.cli-upkaranrc) 
- Advanced Usage
- Troubleshooting
 -->

## License

This project is licensed under the [MIT License](LICENSE). 
<!-- Make sure to add a LICENSE file -->
