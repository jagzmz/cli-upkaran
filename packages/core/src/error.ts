// Base error class for the toolkit
export class AiUpkaranError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name; // Set the error name to the class name
    // Ensure the stack trace is captured correctly (important for V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Specific error types can extend the base error

export class ConfigError extends AiUpkaranError {
  constructor(message: string) {
    super(`Configuration Error: ${message}`);
  }
}

export class PluginError extends AiUpkaranError {
  constructor(pluginName: string, message: string) {
    super(`Plugin Error [${pluginName}]: ${message}`);
  }
}

export class DataPrepError extends AiUpkaranError {
  constructor(
    message: string,
    public underlyingError?: Error,
  ) {
    super(`Data Preparation Error: ${message}`);
    if (underlyingError) {
      this.cause = underlyingError;
    }
  }
}

// Add more specific error types as needed (e.g., AdapterError, FileSystemError, NetworkError)
