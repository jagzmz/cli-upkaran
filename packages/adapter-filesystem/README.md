# `@cli-upkaran/adapter-filesystem`

[![npm version](https://badge.fury.io/js/%40cli-upkaran%2Fadapter-filesystem.svg)](https://badge.fury.io/js/%40cli-upkaran%2Fadapter-filesystem)

Filesystem data preparation adapter for `cli-upkaran`.

This package provides an adapter for reading and processing files from the local filesystem as part of a data preparation pipeline within `cli-upkaran` commands.

## Features

*   Reads files based on glob patterns.
*   Supports ignore patterns (including `.gitignore` style files).
*   Handles text and potentially binary files.
*   Integrates with the `@cli-upkaran/dataprep-core` pipeline.

## Installation

This package is intended to be used as a dependency by `cli-upkaran` command plugins that need to process local files.

```bash
pnpm add @cli-upkaran/adapter-filesystem
```

## Usage

Command plugins can utilize this adapter to configure file inputs.

```typescript
// Within a command plugin's implementation
import { processFiles } from '@cli-upkaran/adapter-filesystem';
import type { DataPrepAdapterOptions } from '@cli-upkaran/dataprep-core';

async function runMyCommand(options: MyCommandOptions) {
  const adapterOptions: DataPrepAdapterOptions = {
    match: options.includePatterns || ['**/*'],
    ignore: options.ignorePatterns || [],
    ignoreFile: options.ignoreFilePath,
    useGitignore: options.useGitignore,
    // ... other adapter config ...
  };
  
  // Use the adapter to get data sources
  const dataSources = await processFiles(adapterOptions);
  
  // ... process dataSources ...
}
```

*(Note: The exact API (`processFiles`) is illustrative and may differ based on actual implementation.)*

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root of the repository.

## License

MIT - See the main [LICENSE](../../LICENSE) file in the root of the repository. 