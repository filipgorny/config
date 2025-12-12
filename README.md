# @filipgorny/config

Type-safe configuration management library with built-in validation and dependency injection support.

## Features

- 🔒 **Type-safe** - Full TypeScript support with type inference
- ✅ **Automatic Validation** - Validates required properties at runtime
- 🎯 **Simple API** - Clean and intuitive interface
- 🔄 **Default Values** - Built-in support for default configurations
- 🪶 **Lightweight** - Minimal dependencies
- 🔌 **DI Support** - Works seamlessly with dependency injection containers
- 📄 **DotEnv Integration** - Built-in support for .env files
- 🚀 **Zero Config** - Works out of the box

## Installation

```bash
npm install @filipgorny/config
```

or

```bash
pnpm add @filipgorny/config
```

or

```bash
yarn add @filipgorny/config
```

## Quick Start

```typescript
import { createDotEnvConfig } from "@filipgorny/config";

const config = createDotEnvConfig();

// Read configuration with validation
const appConfig = config.read({
  PORT: 3000, // Default value
  NODE_ENV: "development", // Default value
  API_KEY: undefined, // Required (throws if missing)
  DATABASE_URL: undefined, // Required (throws if missing)
});

console.log(appConfig.PORT); // number
console.log(appConfig.API_KEY); // string
console.log(appConfig.DATABASE_URL); // string
```

## Usage

### Basic Configuration Reading

The `read()` method is the recommended way to read configuration values. It provides:

- Automatic validation for required properties
- Default values for optional properties
- Type-safe return values

```typescript
import { createDotEnvConfig } from "@filipgorny/config";

const config = createDotEnvConfig();

// Define your configuration schema
const appConfig = config.read({
  // Required properties (undefined = must exist)
  DATABASE_URL: undefined,
  API_KEY: undefined,

  // Optional properties with defaults
  PORT: 3000,
  NODE_ENV: "development",
  LOG_LEVEL: "info",
  ENABLE_DEBUG: false,
});

// All properties are now guaranteed to exist
console.log(appConfig.DATABASE_URL); // string - guaranteed to exist
console.log(appConfig.PORT); // number - from env or default
console.log(appConfig.NODE_ENV); // string - from env or default
```

### Error Handling

When a required property is missing, a `ConfigPropertyDoesNotExistError` is thrown:

```typescript
import {
  createDotEnvConfig,
  ConfigPropertyDoesNotExistError,
} from "@filipgorny/config";

const config = createDotEnvConfig();

try {
  const appConfig = config.read({
    REQUIRED_API_KEY: undefined,
  });
} catch (error) {
  if (error instanceof ConfigPropertyDoesNotExistError) {
    console.error(`Missing config: ${error.propertyName}`);
    // Output: Missing config: REQUIRED_API_KEY
    process.exit(1);
  }
}
```

### Individual Property Access

You can also access properties individually using `get()` and `has()`:

```typescript
const config = createDotEnvConfig();

// Check if property exists
if (config.has("API_KEY")) {
  const apiKey = config.get<string>("API_KEY");
  console.log(apiKey);
}

// Get with type
const port = config.get<number>("PORT");
const debug = config.get<boolean>("DEBUG");
```

### Custom .env File Path

By default, the library searches for `.env` file starting from the current directory and moving upward. You can specify a custom path:

```typescript
import { createDotEnvConfig } from "@filipgorny/config";

// Absolute path
const config1 = createDotEnvConfig("/path/to/.env");

// Relative path
const config2 = createDotEnvConfig("./config/.env");

// Different environment files
const config3 = createDotEnvConfig(".env.production");
```

### Organizing Configuration

**Recommended Pattern:**

Create a centralized configuration file for your application:

```typescript
// src/config/index.ts
import { createDotEnvConfig } from "@filipgorny/config";

const configProvider = createDotEnvConfig();

export const config = configProvider.read({
  // Server
  PORT: 3000,
  HOST: "localhost",
  NODE_ENV: "development",

  // Database
  DATABASE_URL: undefined, // Required
  DATABASE_POOL_SIZE: 10,

  // External APIs
  OPENAI_API_KEY: undefined, // Required
  STRIPE_SECRET_KEY: undefined, // Required

  // Features
  ENABLE_CACHE: true,
  ENABLE_RATE_LIMITING: true,

  // Logging
  LOG_LEVEL: "info",
});

export type AppConfig = typeof config;
```

Then import it throughout your application:

```typescript
// src/server.ts
import { config } from "./config";

const server = createServer({
  port: config.PORT,
  host: config.HOST,
});

// src/database.ts
import { config } from "./config";

const db = connectDatabase(config.DATABASE_URL);
```

## API Reference

### `createDotEnvConfig(dotenvPath?: string): Config`

Creates a Config instance with DotEnv provider.

**Parameters:**

- `dotenvPath` (optional): Path to .env file. Defaults to `.env` and searches upward from current directory.

**Returns:** `Config` instance

**Example:**

```typescript
const config = createDotEnvConfig();
const config = createDotEnvConfig(".env.production");
const config = createDotEnvConfig("/absolute/path/.env");
```

---

### `config.read<T>(properties: T): ConfigValues<T>`

Reads multiple configuration properties with automatic validation.

**Parameters:**

- `properties`: Object where keys are property names and values are default values
  - `undefined` = required property (throws if missing)
  - Any other value = default value if property doesn't exist

**Returns:** Object with all requested properties

**Throws:** `ConfigPropertyDoesNotExistError` if a required property is missing

**Example:**

```typescript
const values = config.read({
  REQUIRED_PROP: undefined, // Must exist
  OPTIONAL_PROP: "default", // Uses default if missing
});
```

---

### `config.get<T>(key: string): T`

Gets a single configuration value.

**Parameters:**

- `key`: Configuration key name

**Returns:** Configuration value or `undefined` if not found

**Example:**

```typescript
const apiKey = config.get<string>("API_KEY");
const port = config.get<number>("PORT");
const debug = config.get<boolean>("DEBUG");
```

---

### `config.has(key: string): boolean`

Checks if a configuration key exists.

**Parameters:**

- `key`: Configuration key name

**Returns:** `true` if key exists, `false` otherwise

**Example:**

```typescript
if (config.has("OPTIONAL_FEATURE")) {
  enableFeature();
}
```

---

### `ConfigPropertyDoesNotExistError`

Error thrown when a required configuration property is missing.

**Properties:**

- `propertyName`: Name of the missing property
- `message`: Error message
- `name`: "ConfigPropertyDoesNotExistError"

**Example:**

```typescript
try {
  config.read({ REQUIRED: undefined });
} catch (error) {
  if (error instanceof ConfigPropertyDoesNotExistError) {
    console.log(error.propertyName); // "REQUIRED"
  }
}
```

## Advanced Usage

### Custom Config Provider

You can create custom configuration providers by implementing the `ConfigProvider` interface:

```typescript
import { Config, ConfigProvider } from "@filipgorny/config";

class CustomConfigProvider implements ConfigProvider {
  private data: Record<string, any> = {};

  constructor() {
    // Load config from your custom source
    this.data = loadFromCustomSource();
  }

  get(key: string): string | number | boolean | undefined {
    return this.data[key];
  }

  has(key: string): boolean {
    return key in this.data;
  }
}

const config = new Config(new CustomConfigProvider());
```

### Dependency Injection Integration

The Config class works seamlessly with `@filipgorny/di`:

```typescript
import { createContainer } from "@filipgorny/di";
import { DotEnvConfigProvider, Config } from "@filipgorny/config";

const container = createContainer();

// Register the provider
container.registerInstance("configProvider", new DotEnvConfigProvider());

// Register the config
container.register("config", Config);

// Use it
const config = container.get<Config>("config");
```

### Type Definitions

For better type safety, define your config interface:

```typescript
interface AppConfig {
  PORT: number;
  DATABASE_URL: string;
  API_KEY: string;
  NODE_ENV: "development" | "production" | "test";
  ENABLE_DEBUG: boolean;
}

const config = createDotEnvConfig();
const appConfig: AppConfig = config.read({
  PORT: 3000,
  DATABASE_URL: undefined,
  API_KEY: undefined,
  NODE_ENV: "development",
  ENABLE_DEBUG: false,
});
```

## Best Practices

### 1. Centralize Configuration

Create a single configuration file that exports your app config:

```typescript
// config/index.ts
export const config = createDotEnvConfig().read({
  // All your config here
});
```

### 2. Use Undefined for Required Properties

Always use `undefined` for properties that MUST exist:

```typescript
const config = configProvider.read({
  CRITICAL_API_KEY: undefined, // ✅ Will throw if missing
  OPTIONAL_FEATURE: "off", // ✅ Has default
});
```

### 3. Validate Early

Load and validate configuration at application startup:

```typescript
// index.ts
import { config } from "./config";

// Config is validated here, before starting the app
startApplication(config);
```

### 4. Use TypeScript

Define types for your configuration:

```typescript
const config = configProvider.read({
  PORT: 3000,
  DEBUG: false,
});

type Config = typeof config;
// Config is: { PORT: number, DEBUG: boolean }
```

### 5. Environment-Specific Files

Use different .env files for different environments:

```typescript
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

const config = createDotEnvConfig(envFile);
```

## Environment Variables

The DotEnv provider automatically parses common types:

- **Strings**: Any text value
- **Numbers**: Automatically converted (e.g., `PORT=3000` → `3000`)
- **Booleans**: `"true"` or `"false"` (case-insensitive) → `true` / `false`

**Example .env file:**

```env
# Server
PORT=3000
HOST=localhost
NODE_ENV=development

# Database
DATABASE_URL=postgresql://localhost/mydb
DATABASE_POOL_SIZE=10

# API Keys
OPENAI_API_KEY=sk-xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Feature Flags
ENABLE_CACHE=true
ENABLE_RATE_LIMITING=false

# Logging
LOG_LEVEL=debug
```

## Migration Guide

### From Manual Validation

**Before:**

```typescript
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY is required");
}

const config = { port, apiKey };
```

**After:**

```typescript
const config = createDotEnvConfig().read({
  PORT: 3000,
  API_KEY: undefined,
});
```

### From dotenv Package

**Before:**

```typescript
import dotenv from "dotenv";
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "3000"),
  apiKey: process.env.API_KEY!,
};
```

**After:**

```typescript
import { createDotEnvConfig } from "@filipgorny/config";

const config = createDotEnvConfig().read({
  PORT: 3000,
  API_KEY: undefined,
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Filip Gorny

## Links

- [GitHub Repository](https://github.com/filipgorny)
- [npm Package](https://www.npmjs.com/package/@filipgorny/config)
- [Issues](https://github.com/filipgorny/flex-organizer/issues)
