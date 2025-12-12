import { Config } from "@/config/config";
import { DotEnvConfigProvider } from "@/providers/dotenv-config-provider";

export function createDotEnvConfig(dotenvPath: string = ".env"): Config {
  const provider = new DotEnvConfigProvider(dotenvPath);
  return new Config(provider);
}
