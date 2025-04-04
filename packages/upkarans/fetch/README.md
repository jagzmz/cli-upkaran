# `@cli-upkaran/fetch`

[![npm version](https://badge.fury.io/js/%40cli-upkaran%2Ffetch.svg)](https://badge.fury.io/js/%40cli-upkaran%2Ffetch)

The `fetch` command implementation for `cli-upkaran`.

This package provides the `fetch` command, which fetches and processes content from websites using a data preparation pipeline.

## Features

*   Provides the `fetch` command (e.g., `@cli-upkaran/fetch:fetch`).
*   Uses the `@cli-upkaran/adapter-website` to fetch and process web content.
*   Supports fetching single URLs, sitemaps, or crawling.
*   Options for filtering, content extraction (selectors), concurrency, depth, etc.
*   Integrates with `@cli-upkaran/dataprep-core` for potential transformations.
*   Outputs to specified file formats (e.g., Markdown, JSON, Text).

## Installation

This plugin is typically installed and managed via the main `cli-upkaran` tool:

```bash
cli-upkaran plugins add @cli-upkaran/fetch --install
```

## Usage

Once registered, use the command via the main CLI:

```bash
cli-upkaran @cli-upkaran/fetch:fetch https://example.com --output example.md --selector "main article"

# Check help for specific options
cli-upkaran @cli-upkaran/fetch:fetch --help
```

*(Note: The exact command name used for invocation (`@cli-upkaran/fetch:fetch`) depends on the core CLI's naming convention.)*

## Contributing

See the main [CONTRIBUTING.md](../../../CONTRIBUTING.md) in the root of the repository.

## License

MIT - See the main [LICENSE](../../../LICENSE) file in the root of the repository. 