# `@cli-upkaran/digest`

[![npm version](https://badge.fury.io/js/%40cli-upkaran%2Fdigest.svg)](https://badge.fury.io/js/%40cli-upkaran%2Fdigest)

The `digest` command implementation for `cli-upkaran`.

This package provides the `digest` command, which processes local files using a data preparation pipeline to create a consolidated output, often used for feeding codebase context to LLMs.

## Features

*   Provides the `digest` command (e.g., `@cli-upkaran/digest:digest`).
*   Uses the `@cli-upkaran/adapter-filesystem` to read local files.
*   Supports include/exclude patterns and ignore files.
*   Integrates with `@cli-upkaran/dataprep-core` for potential transformations (like whitespace removal, chunking - if implemented).
*   Outputs to specified file formats (e.g., Markdown, JSON).

## Installation

This plugin is typically installed and managed via the main `cli-upkaran` tool:

```bash
cli-upkaran plugins add @cli-upkaran/digest --install
```

## Usage

Once registered, use the command via the main CLI:

```bash
cli-upkaran @cli-upkaran/digest:digest --output codebase.md --ignore "**/*.log" node_modules

# Check help for specific options
cli-upkaran @cli-upkaran/digest:digest --help
```

*(Note: The exact command name used for invocation (`@cli-upkaran/digest:digest`) depends on the core CLI's naming convention.)*

## Contributing

See the main [CONTRIBUTING.md](../../../CONTRIBUTING.md) in the root of the repository.

## License

MIT - See the main [LICENSE](../../../LICENSE) file in the root of the repository. 