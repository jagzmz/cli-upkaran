# `cli-upkaran`

[![npm version](https://badge.fury.io/js/%40cli-upkaran%2Fcli.svg)](https://badge.fury.io/js/%40cli-upkaran%2Fcli)

Main CLI entry point for the `cli-upkaran` toolkit.

This package provides the main executable (`cli-upkaran`) that users interact with. It orchestrates plugin loading, command registration, and execution.

## Features

*   Provides the `cli-upkaran` command.
*   Handles command-line argument parsing (using Commander.js).
*   Loads core configuration and plugins via `@cli-upkaran/core`.
*   Registers built-in commands (like `plugins list`, `add`, etc.).
*   Registers commands loaded from plugins.
*   Includes an interactive mode (using `@clack/prompts`) for command discovery (optional).
*   Manages plugin installation/validation workflows.

## Installation

Install this package globally to use the CLI:

```bash
npm install -g cli-upkaran
# or
pnpm add -g cli-upkaran
```

## Usage

See the main [README.md](../../README.md) at the root of the repository for detailed usage instructions.

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root of the repository.

## License

MIT - See the main [LICENSE](../../LICENSE) file in the root of the repository. 