import { JsonConfigProvider } from "@/providers/json-config-provider";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("JsonConfigProvider", () => {
  let tempDir: string;
  let jsonFilePath: string;

  beforeEach(() => {
    // Create a temporary directory for test JSON files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "config-test-"));
    jsonFilePath = path.join(tempDir, "config.json");
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(jsonFilePath)) {
      fs.unlinkSync(jsonFilePath);
    }
    fs.rmdirSync(tempDir);
  });

  describe("loadConfig", () => {
    it("should load string values", () => {
      const configData = { STRING_KEY: "test_value" };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.get("STRING_KEY")).toBe("test_value");
    });

    it("should load number values", () => {
      const configData = { NUMBER_KEY: 42, FLOAT_KEY: 3.14 };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.get("NUMBER_KEY")).toBe(42);
      expect(provider.get("FLOAT_KEY")).toBe(3.14);
    });

    it("should load boolean values", () => {
      const configData = { BOOL_TRUE: true, BOOL_FALSE: false };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.get("BOOL_TRUE")).toBe(true);
      expect(provider.get("BOOL_FALSE")).toBe(false);
    });

    it("should load nested object values", () => {
      const configData = {
        database: {
          host: "localhost",
          port: 5432,
          credentials: {
            username: "user",
            password: "pass",
          },
        },
      };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.get("database.host")).toBe("localhost");
      expect(provider.get("database.port")).toBe(5432);
      expect(provider.get("database.credentials.username")).toBe("user");
      expect(provider.get("database.credentials.password")).toBe("pass");
    });

    it("should load array values", () => {
      const configData = {
        services: [
          { name: "service1", url: "http://service1" },
          { name: "service2", url: "http://service2" },
        ],
      };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.get("services")).toEqual([
        { name: "service1", url: "http://service1" },
        { name: "service2", url: "http://service2" },
      ]);
    });

    it("should return undefined for non-existent key", () => {
      const configData = { KEY: "value" };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.get("NON_EXISTENT")).toBeUndefined();
    });

    it("should return undefined for non-existent nested key", () => {
      const configData = { database: { host: "localhost" } };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.get("database.nonexistent")).toBeUndefined();
    });

    it("should throw error for invalid JSON", () => {
      fs.writeFileSync(jsonFilePath, "{ invalid json }");
      expect(() => new JsonConfigProvider(jsonFilePath)).toThrow(
        "Invalid JSON",
      );
    });

    it("should throw error for non-existent file", () => {
      expect(() => new JsonConfigProvider("non-existent.json")).toThrow(
        "Configuration file not found",
      );
    });
  });

  describe("has", () => {
    it("should return true for existing key", () => {
      const configData = { EXISTING_KEY: "value" };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.has("EXISTING_KEY")).toBe(true);
    });

    it("should return false for non-existent key", () => {
      const configData = { KEY: "value" };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.has("NON_EXISTENT")).toBe(false);
    });

    it("should return true for existing nested key", () => {
      const configData = { database: { host: "localhost" } };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.has("database.host")).toBe(true);
    });

    it("should return false for non-existent nested key", () => {
      const configData = { database: { host: "localhost" } };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.has("database.port")).toBe(false);
    });
  });

  describe("getAll", () => {
    it("should return the entire configuration object", () => {
      const configData = {
        key1: "value1",
        key2: 42,
        nested: { key: "value" },
      };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));
      const provider = new JsonConfigProvider(jsonFilePath);

      expect(provider.getAll()).toEqual(configData);
    });
  });

  describe("resolveConfigPath", () => {
    it("should use absolute path when provided", () => {
      const absolutePath = path.resolve(jsonFilePath);
      const configData = { key: "value" };
      fs.writeFileSync(absolutePath, JSON.stringify(configData));

      const provider = new JsonConfigProvider(absolutePath);
      expect(provider.get("key")).toBe("value");
    });

    it("should use CONFIG_PATH environment variable", () => {
      const originalEnv = process.env.CONFIG_PATH;
      process.env.CONFIG_PATH = jsonFilePath;

      try {
        const configData = { key: "value" };
        fs.writeFileSync(jsonFilePath, JSON.stringify(configData));

        const provider = new JsonConfigProvider("dummy.json");
        expect(provider.get("key")).toBe("value");
      } finally {
        process.env.CONFIG_PATH = originalEnv;
      }
    });

    it("should use absolute path", () => {
      const configData = { key: "value" };
      fs.writeFileSync(jsonFilePath, JSON.stringify(configData));

      const provider = new JsonConfigProvider(jsonFilePath);
      expect(provider.get("key")).toBe("value");
    });
  });
});
