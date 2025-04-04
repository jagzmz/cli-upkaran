# `@cli-upkaran/core`

[![npm version](https://badge.fury.io/js/%40cli-upkaran%2Fcore.svg)](https://badge.fury.io/js/%40cli-upkaran%2Fcore)

Core utilities, types, and plugin system for `cli-upkaran`.

This package provides the essential building blocks for the `cli-upkaran` toolkit and its plugins.

## Features

*   Defines core types (`GlobalConfig`, `PluginConfig`, `CommandDefinition`, etc.)
*   Plugin loading mechanism (`plugin-loader.ts`)
*   Configuration management (`config.ts`)
*   Shared utilities (e.g., `logger.ts`)
*   Custom error classes (`error.ts`)

## Installation

This package is primarily intended as a dependency for `cli-upkaran` plugins.

```bash
pnpm add @cli-upkaran/core
```

## Usage

Plugin developers will import types and potentially utilities from this package.

```typescript
import type {
  CommandDefinition,
  CommandPlugin,
  RegisterCommandsFn
} from '@cli-upkaran/core';

// ... plugin code ...
```

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root of the repository.

## License

MIT - See the main [LICENSE](../../LICENSE) file in the root of the repository. 