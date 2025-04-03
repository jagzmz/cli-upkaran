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

// Add more utils as needed
