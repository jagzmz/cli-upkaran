import type { Command } from 'commander';
import type { CommandDefinition } from '@ai-upkaran/core';
import { runFetch } from './fetch.js';
import { configureFetchOptions, type FetchOptions } from './options.js';
import path from 'node:path';

const fetchCommandDefinition: CommandDefinition = {
  name: 'fetch',
  description:
    'Fetches and processes content from websites (via crawling or sitemap) into a single output.',
  aliases: ['f', 'scrape'],
  configure: configureFetchOptions,
  handler: async (options: FetchOptions, command: Command) => {
    const urlOrSitemap = command.args[0]; // URL or sitemap path is required
    if (!urlOrSitemap) {
      // Commander should handle required args, but good to check
      throw new Error('Missing required argument: <url_or_sitemap_path>');
    }

    // Output file is relative to cwd unless it's absolute
    const outputFile = path.isAbsolute(options.output)
      ? options.output
      : path.resolve(process.cwd(), options.output);

    await runFetch(urlOrSitemap, outputFile, options);
  },
};

// Plugin registration function (if using plugin system)
export function registerCommands() {
  return {
    type: 'command',
    commands: [fetchCommandDefinition],
  };
}

// Direct registration function (if used by CLI)
export function registerFetchCommand(program: Command) {
  const cmd = program.command(fetchCommandDefinition.name);
  cmd.description(fetchCommandDefinition.description);
  cmd.aliases(fetchCommandDefinition.aliases ?? []);
  // Add required argument
  cmd.argument(
    '<url_or_sitemap_path>',
    'Starting URL or path/URL to sitemap.xml',
  );

  if (fetchCommandDefinition.configure) {
    fetchCommandDefinition.configure(cmd);
  }
  cmd.action(fetchCommandDefinition.handler);
}
