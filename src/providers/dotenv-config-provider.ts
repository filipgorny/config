import { ConfigProvider } from "./config-provider";
import { Inject } from "@filipgorny/di";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

export class DotEnvConfigProvider implements ConfigProvider {
  private config: Record<string, string | number | boolean> = {};

  constructor(@Inject("dotenvPath") private dotenvPath: string = ".env") {
    this.loadConfig();
  }

  private findRootEnvPath(): string {
    // If absolute path provided, use it
    if (path.isAbsolute(this.dotenvPath)) {
      return this.dotenvPath;
    }

    // Start from current working directory
    let currentDir = process.cwd();

    // Search upward until we find .env or reach the root
    while (currentDir !== path.parse(currentDir).root) {
      const envPath = path.join(currentDir, this.dotenvPath);
      if (fs.existsSync(envPath)) {
        return envPath;
      }

      // Move to parent directory
      currentDir = path.dirname(currentDir);
    }

    // If not found, return the path relative to cwd
    return path.join(process.cwd(), this.dotenvPath);
  }

  private loadConfig(): void {
    const envPath = this.findRootEnvPath();
    const result = dotenv.config({ path: envPath });

    if (result.error) {
      throw result.error;
    }

    this.config = { ...result.parsed };
  }

  get(key: string): string | number | boolean | undefined {
    const value = this.config[key];

    if (typeof value === "string") {
      // Try to parse boolean
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;

      // Try to parse number
      const num = Number(value);
      if (!isNaN(num)) return num;

      // Return as string
      return value;
    }

    return value;
  }

  has(key: string): boolean {
    return key in this.config;
  }
}
