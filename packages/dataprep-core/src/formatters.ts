import path from 'node:path';
import type { ContentItem } from './content-item.js';
import type { Writable } from 'node:stream';

/**
 * Options passed to a Formatter's format method.
 */
export interface FormatterOptions {
  /** Include source comments or headers in the output */
  includeSource?: boolean;
  /** Maximum estimated tokens allowed (formatter might truncate) */
  maxTokens?: number;
  /** Add any other formatter-specific options using index signature */
  [key: string]: any;
}

/**
 * Interface for Data Preparation Formatters.
 * Formatters take the stream of processed ContentItems and write the final output.
 */
export interface Formatter {
  /** The unique name of the formatter (e.g., 'markdown', 'json', 'text') */
  name: string;

  /**
   * Consumes the stream of ContentItems and writes to the output stream.
   *
   * @param items - An async iterable yielding processed ContentItem objects.
   * @param outputStream - The Writable stream to write the final output to.
   * @param options - Configuration options for the formatter.
   * @returns A promise that resolves when formatting is complete.
   */
  format(
    items: AsyncIterable<ContentItem>,
    outputStream: Writable,
    options?: FormatterOptions,
  ): Promise<void>;
}

export const defaultFormatters= {
  json: {
    name: 'json',
    format: async (items: AsyncIterable<ContentItem>, outputStream: Writable, options?: FormatterOptions) => {
      for await (const item of items) {
        outputStream.write(JSON.stringify(item) + '\n');
      }
    },
  },
  markdown: {
    name: 'markdown',
    format: async (items: AsyncIterable<ContentItem>, outputStream: Writable, options?: FormatterOptions) => {
      for await (const item of items) {
        let content;
        if (item.adapter === 'filesystem') {
          const relativePath = path.relative(process.cwd(), item.metadata?.filePath);
          const fileType = path.extname(relativePath).slice(1);
          content = `# ${relativePath}\n\n\`\`\`${fileType}\n${item.content}\n\`\`\`\n\n`;
        }
        else {
          if (item.metadata?.title) {
            content = `# ${item.metadata.title}\n\n${item.content}\n\n`;
          } else {
            content = `${item.content}\n\n`;
          }
        }
        outputStream.write(content);
      }
    },
  },
  text: {
    name: 'text',
    format: async (items: AsyncIterable<ContentItem>, outputStream: Writable, options?: FormatterOptions) => {
      for await (const item of items) {
        let content;
        if (item.metadata?.title) {
          content = `# ${item.metadata.title}\n\n${item.content}\n\n`;
        } else {
          content = `${item.content}\n\n`;
        }
        outputStream.write(content);
      }
    },
  },
} as const;