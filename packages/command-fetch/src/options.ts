import type { Command } from 'commander';
import { Option } from 'commander';

// Define the structure of options specific to the fetch command
export interface FetchOptions {
  output: string;
  format: 'markdown' | 'json' | 'text'; // Allow specific formats
  match?: string[]; // Glob patterns for pathnames
  selector?: string; // CSS selector for main content
  concurrency: number;
  limit?: number;
  depth?: number; // Max crawl depth
  useSitemap: boolean; // Prioritize sitemap if found/provided
  // auth?: string; // Basic auth user:pass
  showUrls: boolean;
  // transform?: string[];
  // plugins?: string[];
  // Add other specific options here
}

/**
 * Configures the Commander command instance with options specific to 'fetch'.
 */
export function configureFetchOptions(command: Command) {
  command
    .addOption(
      new Option('-o, --output <file>', 'Output file path').default(
        'site_content.md',
      ),
    )
    .addOption(
      new Option('--format <format>', 'Output format')
        .choices(['markdown', 'json', 'text'])
        .default('markdown'),
    )
    .option(
      '-m, --match <patterns...>',
      'Micromatch glob patterns for pathnames to include',
    )
    .option(
      '--selector <selector>',
      'CSS selector to extract main content area',
    )
    .addOption(
      new Option('-c, --concurrency <number>', 'Number of concurrent requests')
        .default(5)
        .argParser(parseInt),
    )
    .addOption(
      new Option(
        '--limit <number>',
        'Maximum number of pages to fetch',
      ).argParser(parseInt),
    )
    .addOption(
      new Option(
        '--depth <number>',
        'Maximum crawl depth (if not using sitemap)',
      )
        .default(3)
        .argParser(parseInt),
    )
    .addOption(
      new Option(
        '--use-sitemap',
        'Prefer sitemap.xml for discovery if available at root or specified path',
      ).default(true),
    )
    // .option('--auth <user:pass>', 'Basic authentication credentials')
    .addOption(
      new Option(
        '--show-urls',
        'Display a list of URLs included in the output',
      ).default(false),
    );
  // .option('--transform <names...>', 'Apply specific content transformations')
  // .option('--plugin <paths...>', 'Load data preparation plugins (adapters, transformers, formatters)');
}
