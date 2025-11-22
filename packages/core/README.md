# @genesis/core

> Core engine and utilities for the Genesis environment provisioning system

This package provides the foundational infrastructure for Genesis, including configuration management, plugin system, platform utilities, and execution pipelines.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Core Modules](#core-modules)
  - [Configuration](#configuration)
  - [Plugin System](#plugin-system)
  - [Platform Utilities](#platform-utilities)
  - [File System](#file-system)
  - [Environment Management](#environment-management)
  - [Logging](#logging)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Contributing](#contributing)

---

## Overview

`@genesis/core` is the heart of the Genesis system. It provides:

- **Configuration Management**: Parse, validate, and load YAML/TypeScript configs
- **Plugin System**: Define, load, and execute plugins with dependency resolution
- **Platform Detection**: Cross-platform utilities for macOS, Linux, and Windows
- **Shell Execution**: Safe command execution with proper error handling
- **File System Utilities**: Download files, manage paths
- **Environment Management**: PATH manipulation, environment variable management
- **Logging**: Structured logging with multiple levels and color support

---

## Installation

```bash
# Using npm
npm install @genesis/core

# Using bun
bun add @genesis/core

# Using yarn
yarn add @genesis/core
```

---

## Core Modules

### Configuration

Located in `src/config/`, handles all configuration-related functionality.

#### `defineConfig`

Type-safe configuration definition helper.

```typescript
import { defineConfig } from "@genesis/core";

export default defineConfig({
  tools: [/* ... */],
  sdks: [/* ... */],
  languages: [/* ... */],
  repositories: [/* ... */],
  scripts: [/* ... */],
  env: {/* ... */},
});
```

#### `loadConfig`

Load configuration from file (YAML or TypeScript).

```typescript
import { loadConfig } from "@genesis/core";

const config = await loadConfig("/path/to/genesis.config.yaml");
// or
const config = await loadConfig("/path/to/genesis.config.ts");
```

#### `validateConfig`

Validate configuration against schema using Zod.

```typescript
import { validateConfig } from "@genesis/core";

const validConfig = validateConfig(rawConfig);
```

#### Configuration Schema

```typescript
interface GenesisConfig {
  tools?: GenesisPluginInstance[];
  sdks?: GenesisPluginInstance[];
  languages?: GenesisPluginInstance[];
  repositories?: RepositorySpec[];
  scripts?: ScriptSpec[];
  env?: Record<string, string>;
}
```

### Plugin System

Located in `src/plugins/`, provides the plugin architecture.

#### Plugin Types

```typescript
// Plugin instance (serializable config)
interface GenesisPluginInstance<TOptions = unknown> {
  id: string;
  category: GenesisPluginCategory;
  module: string;
  options: TOptions;
}

// Plugin implementation
interface GenesisPlugin<TOptions = unknown> {
  id: string;
  category: GenesisPluginCategory;
  dependsOn?: string[];
  detect?(runtime: PluginRuntime<TOptions>): Promise<DetectResult>;
  apply?(runtime: PluginRuntime<TOptions>): Promise<ApplyResult>;
  validate?(runtime: PluginRuntime<TOptions>): Promise<ValidateResult>;
}

// Plugin runtime context
interface PluginRuntime<TOptions = unknown> {
  instance: GenesisPluginInstance<TOptions>;
  options: TOptions;
  context: GenesisPluginContext;
}

interface GenesisPluginContext {
  cwd: string;
  env: NodeJS.ProcessEnv;
  logger: Logger;
}
```

#### Plugin Execution

```typescript
import {
  collectPluginInstances,
  loadPlugins,
  buildPluginGraph,
  runDetect,
  runApply,
  runValidate,
  runDiff,
} from "@genesis/core";

// Collect all plugin instances from config
const instances = collectPluginInstances(config);

// Load plugin implementations
const plugins = await loadPlugins(instances);

// Build dependency graph
const graph = buildPluginGraph(plugins);

// Execute plugin methods
const detectResults = await runDetect(graph, context);
const applyResults = await runApply(graph, context);
const validateResults = await runValidate(graph, context);
const diffResults = await runDiff(graph, context);
```

### Platform Utilities

Located in `src/os/`, provides cross-platform utilities.

#### Platform Detection

```typescript
import { getPlatform, type Platform } from "@genesis/core";

const platform = getPlatform();
// Returns: "macos" | "windows" | "linux"

if (platform === "windows") {
  // Windows-specific logic
} else {
  // macOS/Linux logic
}
```

#### Shell Command Execution

```typescript
import { runCommand } from "@genesis/core";

const result = await runCommand("node", ["--version"], {
  cwd: "/path/to/directory",
  env: process.env,
});

console.log(result.code);    // Exit code
console.log(result.stdout);  // Standard output
console.log(result.stderr);  // Standard error
```

### File System

Located in `src/fs/`, provides file system utilities.

#### Download Files

```typescript
import { downloadFile } from "@genesis/core";

await downloadFile(
  "https://example.com/file.tar.gz",
  "/local/path/file.tar.gz"
);
```

#### Path Utilities

```typescript
import { resolvePath, ensureDir } from "@genesis/core";

const absolutePath = resolvePath("./relative/path");
await ensureDir("/path/to/directory");
```

### Environment Management

Located in `src/env/`, manages environment variables and PATH.

#### PATH Manipulation

```typescript
import { editPath } from "@genesis/core";

// Add directory to PATH
await editPath({
  action: "add",
  value: "/usr/local/bin",
});

// Remove directory from PATH
await editPath({
  action: "remove",
  value: "/old/path",
});
```

#### Environment Variables

```typescript
import { applyEnvPatch } from "@genesis/core";

await applyEnvPatch({
  NODE_ENV: "development",
  API_URL: "http://localhost:3000",
});
```

### Logging

Located in `src/utils/`, provides structured logging.

#### Logger

```typescript
import { Logger } from "@genesis/core";

const logger = new Logger({
  level: "info",        // "debug" | "info" | "warn" | "error"
  useColors: true,      // Enable color output
  prefix: "[MyPlugin]", // Optional prefix
});

logger.debug("Detailed debugging information");
logger.info("General information");
logger.warn("Warning message");
logger.error("Error message");
```

---

## API Reference

### Exports

```typescript
// Configuration
export { defineConfig } from "./config/defineConfig.js";
export { loadConfig } from "./config/parser.js";
export { validateConfig } from "./config/validator.js";
export type { GenesisConfig, GenesisPluginInstance } from "./config/schema.js";

// Plugin System
export {
  collectPluginInstances,
  loadPlugins,
  buildPluginGraph,
} from "./plugins/loader.js";
export {
  runDetect,
  runApply,
  runValidate,
  runDiff,
} from "./plugins/executor.js";
export type {
  GenesisPlugin,
  PluginRuntime,
  GenesisPluginContext,
  DetectResult,
  ApplyResult,
  ValidateResult,
} from "./plugins/types.js";

// Platform Utilities
export { getPlatform, type Platform } from "./os/platform.js";
export { runCommand, type RunCommandResult } from "./os/shell.js";

// File System
export { downloadFile } from "./fs/download.js";
export { resolvePath, ensureDir } from "./fs/paths.js";

// Environment
export { editPath } from "./env/path-editor.js";
export { applyEnvPatch } from "./env/vars.js";

// Logging
export { Logger, type LogLevel } from "./utils/logger.js";
```

---

## Usage Examples

### Creating a Configuration

```typescript
import { defineConfig } from "@genesis/core";

export default defineConfig({
  tools: [
    {
      id: "node",
      category: "tool",
      module: "@genesis/plugins/node",
      options: { version: "20", use_nvm: true },
    },
  ],
  env: {
    NODE_ENV: "development",
  },
});
```

### Loading and Executing Plugins

```typescript
import {
  loadConfig,
  collectPluginInstances,
  loadPlugins,
  buildPluginGraph,
  runApply,
  Logger,
} from "@genesis/core";

// Load configuration
const config = await loadConfig("./genesis.config.yaml");

// Collect plugin instances
const instances = collectPluginInstances(config);

// Load plugin implementations
const plugins = await loadPlugins(instances);

// Build dependency graph
const graph = buildPluginGraph(plugins);

// Create logger
const logger = new Logger({ level: "info" });

// Execute plugins
const results = await runApply(graph, {
  cwd: process.cwd(),
  env: process.env,
  logger,
});

// Process results
results.forEach((result) => {
  console.log(`${result.id}: ${result.ok ? "✓" : "✗"} ${result.details}`);
});
```

---

## Development

### Building

```bash
# Build the package
bun run build

# Watch mode
bun run build --watch
```

### Testing

```bash
# Run tests
bun test

# Run tests in watch mode
bun test --watch
```

### Project Structure

```
src/
├── config/           # Configuration management
│   ├── defineConfig.ts
│   ├── parser.ts
│   ├── schema.ts
│   └── validator.ts
├── plugins/          # Plugin system
│   ├── executor.ts
│   ├── loader.ts
│   └── types.ts
├── os/               # Platform utilities
│   ├── platform.ts
│   └── shell.ts
├── fs/               # File system utilities
│   ├── download.ts
│   └── paths.ts
├── env/              # Environment management
│   ├── path-editor.ts
│   └── vars.ts
├── utils/            # Utilities
│   └── logger.ts
└── index.ts          # Main export
```

---

## Contributing

Contributions are welcome! Please see the [main repository](../../README.md) for contribution guidelines.

---

**Part of the [Genesis](../../README.md) project**
