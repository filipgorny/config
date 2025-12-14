import { ConfigProvider } from "./config-provider";
import * as fs from "fs";
import * as path from "path";

/**
 * JSON configuration provider
 * Loads configuration from a JSON file
 */
export class JsonConfigProvider implements ConfigProvider {
  private config: Record<string, any> = {};

  constructor(private jsonPath: string) {
    this.loadConfig();
  }

  private resolveConfigPath(): string {
    // If absolute path provided, use it
    if (path.isAbsolute(this.jsonPath)) {
      return this.jsonPath;
    }

    // If environment variable is set, use that
    const envPath = process.env.CONFIG_PATH;
    if (envPath) {
      return path.resolve(envPath);
    }

    // Otherwise use the provided path relative to cwd
    return path.resolve(process.cwd(), this.jsonPath);
  }

  private loadConfig(): void {
    const configPath = this.resolveConfigPath();

    if (!fs.existsSync(configPath)) {
      throw new Error(
        `Configuration file not found: ${configPath}\n` +
          `Provide a valid path or set CONFIG_PATH environment variable.`,
      );
    }

    try {
      const content = fs.readFileSync(configPath, "utf-8");
      this.config = JSON.parse(content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `Invalid JSON in configuration file: ${configPath}\n${error.message}`,
        );
      }
      throw error;
    }
  }

  get(key: string): any {
    // Support nested keys with dot notation (e.g., "database.host")
    const keys = key.split(".");
    let value: any = this.config;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Get the entire configuration object
   */
  getAll(): Record<string, any> {
    return { ...this.config };
  }
}
