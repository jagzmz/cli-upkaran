// Add highly generic, universally applicable utility functions here.
// Avoid adding functions specific to a particular domain (like data prep or CLI rendering).

/**
 * Ensures that the input is an array.
 * If the input is not an array, it wraps it in a new array.
 *
 * @param input - The value to ensure is an array.
 * @returns An array containing the input value(s).
 */
export function ensureArray<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}

/**
 * A simple sleep function.
 * @param ms Milliseconds to sleep.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Prints a tree structure of the given object.
 * @param tree - The object to print as a tree.
 * @param indent - The indent to use for the tree.
 * @returns A string representation of the tree.
 * @example
 * printTree({
 *   'plugin1': {
 *     'command1': {
 *       'description': 'Command 1 description',
 *     },
 *   },
 */
export function printTree(tree: Record<string, any>, indent: string = ''): string {
  let output = '';
  
  for (const [key, value] of Object.entries(tree)) {
    output += `${indent}${key}\n`;
    
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        // Handle arrays
        for (const item of value) {
          if (typeof item === 'object' && item !== null) {
            output += printTree({ [item.toString()]: item }, `${indent}│ `);
          } else {
            output += `${indent}├── ${item}\n`;
          }
        }
      } else {
        // Handle nested objects
        const entries = Object.entries(value);
        entries.forEach(([nestedKey, nestedValue], index) => {
          const isLast = index === entries.length - 1;
          const prefix = isLast ? '└── ' : '├── ';
          const childIndent = isLast ? `${indent}    ` : `${indent}│   `;
          
          output += `${indent}${prefix}${nestedKey}\n`;
          
          if (nestedValue && typeof nestedValue === 'object') {
            output += printTree({ '': nestedValue }, childIndent).replace(/^    /, '');
          }
        });
      }
    }
  }
  
  return output;
}