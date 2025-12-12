import { Config } from "@/config/config";
import { ConfigProvider } from "@/providers/config-provider";

class MockConfigProvider implements ConfigProvider {
  private data: Record<string, string | number | boolean> = {
    STRING_VALUE: "test",
    NUMBER_VALUE: 42,
    BOOLEAN_VALUE: true,
  };

  get(key: string): string | number | boolean | undefined {
    return this.data[key];
  }

  has(key: string): boolean {
    return key in this.data;
  }
}

describe("Config", () => {
  let config: Config;
  let provider: MockConfigProvider;

  beforeEach(() => {
    provider = new MockConfigProvider();
    config = new Config(provider);
  });

  describe("get", () => {
    it("should get string value", () => {
      const value = config.get<string>("STRING_VALUE");
      expect(value).toBe("test");
    });

    it("should get number value", () => {
      const value = config.get<number>("NUMBER_VALUE");
      expect(value).toBe(42);
    });

    it("should get boolean value", () => {
      const value = config.get<boolean>("BOOLEAN_VALUE");
      expect(value).toBe(true);
    });

    it("should return undefined for non-existent key", () => {
      const value = config.get("NON_EXISTENT");
      expect(value).toBeUndefined();
    });

    it("should default to string type", () => {
      const value = config.get("STRING_VALUE");
      expect(typeof value).toBe("string");
    });
  });

  describe("has", () => {
    it("should return true for existing key", () => {
      expect(config.has("STRING_VALUE")).toBe(true);
      expect(config.has("NUMBER_VALUE")).toBe(true);
      expect(config.has("BOOLEAN_VALUE")).toBe(true);
    });

    it("should return false for non-existent key", () => {
      expect(config.has("NON_EXISTENT")).toBe(false);
    });
  });

  describe("read", () => {
    it("should read multiple config properties", () => {
      const values = config.read({
        STRING_VALUE: undefined,
        NUMBER_VALUE: undefined,
        BOOLEAN_VALUE: undefined,
      });

      expect(values).toEqual({
        STRING_VALUE: "test",
        NUMBER_VALUE: 42,
        BOOLEAN_VALUE: true,
      });
    });

    it("should use default values when property does not exist", () => {
      const values = config.read({
        STRING_VALUE: undefined,
        NON_EXISTENT: "default_value",
        ANOTHER_MISSING: 999,
      });

      expect(values).toEqual({
        STRING_VALUE: "test",
        NON_EXISTENT: "default_value",
        ANOTHER_MISSING: 999,
      });
    });

    it("should throw ConfigPropertyDoesNotExistError when required property is missing", () => {
      expect(() => {
        config.read({
          STRING_VALUE: undefined,
          NON_EXISTENT: undefined,
        });
      }).toThrow(
        'Configuration property "NON_EXISTENT" does not exist or is not defined',
      );
    });

    it("should return typed object with correct values", () => {
      const values = config.read({
        NUMBER_VALUE: 3000,
        STRING_VALUE: undefined,
        BOOLEAN_VALUE: false,
      });

      expect(typeof values.NUMBER_VALUE).toBe("number");
      expect(typeof values.STRING_VALUE).toBe("string");
      expect(typeof values.BOOLEAN_VALUE).toBe("boolean");
    });

    it("should override default values with provider values", () => {
      const values = config.read({
        STRING_VALUE: "default_string",
        NUMBER_VALUE: 0,
      });

      expect(values.STRING_VALUE).toBe("test"); // From provider
      expect(values.NUMBER_VALUE).toBe(42); // From provider
    });
  });
});
