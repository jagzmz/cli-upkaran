import ora, { type Ora } from 'ora';

// Example wrapper for creating spinners

export function startSpinner(text: string): Ora {
  return ora(text).start();
}

// You could add more helper functions here, e.g.,
// export function succeedSpinner(spinner: Ora, text: string) {
//   spinner.succeed(text);
// }
// export function failSpinner(spinner: Ora, text: string) {
//   spinner.fail(text);
// }
