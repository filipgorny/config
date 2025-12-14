import { Inject } from "@filipgorny/di";
import { ConfigProvider } from "@/providers/config-provider";
import { ConfigPropertyDoesNotExistError } from "@/errors/config-property-does-not-exist-error";

export type ConfigValues<T extends Record<string, any>> = T;

export function createConfig(provider: ConfigProvider): Config {
  return new Config(provider);
}

export class Config {
  constructor(private provider: ConfigProvider) {}

  get<T = string>(key: string): T {
    return this.provider.get(key) as T;
  }

  has(key: string): boolean {
    return this.provider.has
      ? this.provider.has(key)
      : this.provider.get(key) !== undefined;
  }

  /**
   * Get the entire configuration object
   */
  getAll(): Record<string, any> {
    // Try to get the getAll method from the provider if it exists
    if (typeof (this.provider as any).getAll === "function") {
      return (this.provider as any).getAll();
    }
    throw new Error("Provider does not support getAll method");
  }

  /**
   * Read multiple configuration properties with validation
   * @param properties Object with property names as keys and optional default values
   * @returns Object with the same keys containing the configuration values
   * @throws ConfigPropertyDoesNotExistError if a required property is missing
   *
   * @example
   * const config = new Config(provider);
   * const values = config.read({
   *   PORT: 3000,
   *   OPENAI_API_KEY: undefined,
   *   NODE_ENV: 'development'
   * });
   * // Returns: { PORT: 3000, OPENAI_API_KEY: 'sk-...', NODE_ENV: 'production' }
   */
  read<T extends Record<string, any>>(
    properties: T,
  ): ConfigValues<{ [K in keyof T]: T[K] extends undefined ? any : T[K] }> {
    const result: any = {};

    for (const [key, defaultValue] of Object.entries(properties)) {
      const value = this.provider.get(key);

      // If value exists in provider, use it
      if (value !== undefined) {
        result[key] = value;
      }
      // If default value is provided, use it
      else if (defaultValue !== undefined) {
        result[key] = defaultValue;
      }
      // Otherwise, throw error
      else {
        throw new ConfigPropertyDoesNotExistError(key);
      }
    }

    return result as ConfigValues<{
      [K in keyof T]: T[K] extends undefined ? any : T[K];
    }>;
  }
}
