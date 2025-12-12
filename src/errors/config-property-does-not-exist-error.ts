/**
 * Error thrown when a required configuration property does not exist
 */
export class ConfigPropertyDoesNotExistError extends Error {
  constructor(public readonly propertyName: string) {
    super(
      `Configuration property "${propertyName}" does not exist or is not defined`,
    );
    this.name = "ConfigPropertyDoesNotExistError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigPropertyDoesNotExistError);
    }
  }
}
