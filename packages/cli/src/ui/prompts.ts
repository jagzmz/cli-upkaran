// Placeholder files for shared UI components (prompts, spinners, etc.)
// These can be expanded later.

import * as p from '@clack/prompts';
import chalk from 'chalk';

// Example wrapper or re-export
export const select = p.select;
export const confirm = p.confirm;
export const text = p.text;
export const intro = p.intro;
export const outro = p.outro;
export const log = p.log;
export const isCancel = p.isCancel;

export function cancelOutro() {
  p.outro(chalk.yellow('Operation cancelled.'));
}
