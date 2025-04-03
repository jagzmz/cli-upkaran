# `@cli-upkaran`

A unified command-line interface (CLI) toolkit and extensible platform for a wide range of AI-related tasks.

## Overview

`@cli-upkaran` (Upkaran: Hindi/Sanskrit for "tool" or "instrument") provides developers and researchers with a consistent, powerful, and user-friendly environment for:

*   Interacting with AI models
*   Advanced data preparation (files, websites)
*   Managing AI workflows

It features a pluggable command system, allowing easy extension with new functionalities like text generation, model interaction, sentiment analysis, fine-tuning, vector database operations, and more.

## Packages

This monorepo contains the following packages:

*   `packages/core`: Universal utilities, types, plugin loading.
*   `packages/cli`: Main entry point (`ai-upkaran`), command routing, interactive mode.
*   `packages/dataprep-core`: Shared logic for data preparation commands.
*   `packages/command-digest`: Implements the `digest` command.
*   `packages/command-fetch`: Implements the `fetch` command.
*   `packages/adapter-filesystem`: Data adapter for local files.
*   `packages/adapter-website`: Data adapter for websites.

(More packages will be added for other commands, adapters, transformers, and formatters).

## Getting Started

**Prerequisites:**

*   Node.js (v20.x or later recommended)
*   pnpm (v9.x recommended)

**Installation & Setup:**

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd ai-upkaran
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Build all packages:
    ```bash
    pnpm run build
    ```

**Usage:**

Run the CLI:

```bash
npx ai-upkaran --help # See global options and available commands

npx ai-upkaran digest --help # Help for the digest command

npx ai-upkaran fetch --help # Help for the fetch command

npx ai-upkaran # Enter interactive mode
```

## Development

*   **Build:** `pnpm run build` (builds all packages)
*   **Watch & Build (Individual Package):** `cd packages/<package-name> && pnpm run build --watch`
*   **Lint:** `pnpm run lint`
*   **Format:** `pnpm run format`
*   **Test:** `pnpm run test`
*   **Clean:** `pnpm run clean`

## Contributing

Contributions are welcome! Please follow the standard fork, branch, commit, and pull request workflow.

## License

MIT 