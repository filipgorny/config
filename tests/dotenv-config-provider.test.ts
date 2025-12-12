import { DotEnvConfigProvider } from "@/providers/dotenv-config-provider";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("DotEnvConfigProvider", () => {
  let tempDir: string;
  let envFilePath: string;

  beforeEach(() => {
    // Create a temporary directory for test .env files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "config-test-"));
    envFilePath = path.join(tempDir, ".env");
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(envFilePath)) {
      fs.unlinkSync(envFilePath);
    }
    fs.rmdirSync(tempDir);
  });

  describe("loadConfig", () => {
    it("should load string values", () => {
      fs.writeFileSync(envFilePath, "STRING_KEY=test_value");
      const provider = new DotEnvConfigProvider(envFilePath);

      expect(provider.get("STRING_KEY")).toBe("test_value");
    });

    it("should parse boolean values", () => {
      fs.writeFileSync(envFilePath, "BOOL_TRUE=true\nBOOL_FALSE=false");
      const provider = new DotEnvConfigProvider(envFilePath);

      expect(provider.get("BOOL_TRUE")).toBe(true);
      expect(provider.get("BOOL_FALSE")).toBe(false);
    });

    it("should parse number values", () => {
      fs.writeFileSync(envFilePath, "NUMBER_KEY=42\nFLOAT_KEY=3.14");
      const provider = new DotEnvConfigProvider(envFilePath);

      expect(provider.get("NUMBER_KEY")).toBe(42);
      expect(provider.get("FLOAT_KEY")).toBe(3.14);
    });

    it("should return undefined for non-existent key", () => {
      fs.writeFileSync(envFilePath, "KEY=value");
      const provider = new DotEnvConfigProvider(envFilePath);

      expect(provider.get("NON_EXISTENT")).toBeUndefined();
    });
  });

  describe("has", () => {
    it("should return true for existing key", () => {
      fs.writeFileSync(envFilePath, "EXISTING_KEY=value");
      const provider = new DotEnvConfigProvider(envFilePath);

      expect(provider.has("EXISTING_KEY")).toBe(true);
    });

    it("should return false for non-existent key", () => {
      fs.writeFileSync(envFilePath, "KEY=value");
      const provider = new DotEnvConfigProvider(envFilePath);

      expect(provider.has("NON_EXISTENT")).toBe(false);
    });
  });
});
