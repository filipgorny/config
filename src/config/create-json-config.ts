import { Config } from "@/config/config";
import { JsonConfigProvider } from "@/providers/json-config-provider";

export function createJsonConfig(jsonPath: string): Config {
  const provider = new JsonConfigProvider(jsonPath);
  return new Config(provider);
}
