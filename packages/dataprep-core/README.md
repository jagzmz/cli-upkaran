# `@cli-upkaran/dataprep-core`

[![npm version](https://badge.fury.io/js/%40cli-upkaran%2Fdataprep-core.svg)](https://badge.fury.io/js/%40cli-upkaran%2Fdataprep-core)

Core data preparation logic, types, and interfaces for `cli-upkaran`.

This package provides the shared foundation for data preparation pipelines used by various `cli-upkaran` commands. It defines the structure for adapters (data sources) and transformers (data modifiers).

## Features

*   Defines core data structures (e.g., `DataSource`, `Document`).
*   Defines interfaces for Adapters and Transformers.
*   Provides utilities for common tasks like text splitting, whitespace removal, and token counting (using `js-tiktoken`).
*   Orchestrates the data preparation pipeline: Adapters -> Transformers -> Formatters.

## Installation

This package is intended as a dependency for `cli-upkaran` commands and adapters/transformers.

```bash
pnpm add @cli-upkaran/dataprep-core
```

## Concepts

*   **Adapters:** Responsible for fetching raw data from a source (e.g., filesystem, website, database) and converting it into a stream of `DataSource` objects.
*   **Transformers:** Modify the content or metadata of `Document` objects within `DataSource`s (e.g., chunking, cleaning, metadata extraction).
*   **Formatters:** Take the final processed `DataSource` objects and format them for output (e.g., Markdown, JSON).

## Usage

Command plugins interact with this core library to execute data preparation pipelines.

```typescript
import {
  runDataPrepPipeline,
  type DataPrepAdapterOptions,
  // ... other types
} from '@cli-upkaran/dataprep-core';

async function runMyDataCommand(options: MyDataCommandOptions) {
  // Configure adapter(s)
  const adapterOptions: DataPrepAdapterOptions = {
     adapterType: 'filesystem', // or 'website', etc.
     // ... adapter-specific config from options ... 
  };
  
  // Configure transformer(s)
  const transformerOptions = { /* ... */ };
  
  // Configure formatter
  const formatterOptions = { format: options.outputFormat };

  // Execute the pipeline
  await runDataPrepPipeline({
    adapterConfigs: [adapterOptions],
    transformerConfigs: [transformerOptions],
    formatterConfig: formatterOptions,
    outputFile: options.outputFile,
  });
}
```

*(Note: The exact API (`runDataPrepPipeline`) is illustrative and may differ based on actual implementation.)*

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root of the repository.

## License

MIT - See the main [LICENSE](../../LICENSE) file in the root of the repository. 