/**
 * Interface for configuration providers
 */
export interface ConfigProvider {
  /**
   * Get a configuration value by key
   * @param key - The configuration key
   * @returns The configuration value or undefined if not found
   */
  get(key: string): string | number | boolean | undefined;

  /**
   * Check if a configuration key exists
   * @param key - The configuration key
   * @returns True if the key exists, false otherwise
   */
  has?(key: string): boolean;
}
