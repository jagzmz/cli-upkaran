# `@cli-upkaran/adapter-website`

[![npm version](https://badge.fury.io/js/%40cli-upkaran%2Fadapter-website.svg)](https://badge.fury.io/js/%40cli-upkaran%2Fadapter-website)

Website data preparation adapter for `cli-upkaran`.

This package provides an adapter for fetching and processing content from websites (single pages, sitemaps, crawls) as part of a data preparation pipeline within `cli-upkaran` commands.

## Features

*   Fetches content from URLs.
*   Discovers URLs via sitemap.xml or crawling (limited depth).
*   Extracts main content using CSS selectors or Readability.
*   Converts HTML to Markdown or extracts plain text.
*   Handles concurrent requests.
*   Supports filtering fetched URLs using glob patterns.
*   Integrates with the `@cli-upkaran/dataprep-core` pipeline.

## Installation

This package is intended to be used as a dependency by `cli-upkaran` command plugins that need to process web content.

```bash
pnpm add @cli-upkaran/adapter-website
```

## Usage

Command plugins can utilize this adapter to configure website fetching.

```typescript
// Within a command plugin's implementation
import { processWebsite } from '@cli-upkaran/adapter-website';
import type { DataPrepAdapterOptions } from '@cli-upkaran/dataprep-core';

async function runMyWebCommand(options: MyWebCommandOptions) {
  const adapterOptions: DataPrepAdapterOptions = {
    url: options.startUrl,
    match: options.includePathPatterns,
    selector: options.contentSelector,
    // ... other website adapter specific options like concurrency, depth, etc.
  };

  // Use the adapter to get data sources
  const dataSources = await processWebsite(adapterOptions);

  // ... process dataSources ...
}
```

*(Note: The exact API (`processWebsite`) is illustrative and may differ based on actual implementation.)*

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root of the repository.

## License

MIT - See the main [LICENSE](../../LICENSE) file in the root of the repository. 