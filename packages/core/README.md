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
  - [Task Registry & Deduplication](#task-registry--deduplication)
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
- **Task Registry & Deduplication**: Eliminate redundant system operations across plugins
- **Three-Phase Execution**: Register tasks → Execute system tasks → Run plugin installations
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
  registerTasks?(runtime: PluginRuntime<TOptions>): Promise<void>;  // NEW!
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
  taskRegistry: TaskRegistry;  // NEW!
}
```

#### Plugin Execution

Genesis uses a **three-phase execution model** to optimize system operations:

**Phase 1: Task Registration** - Plugins register system-level prerequisites
**Phase 2: Task Execution** - System tasks execute once (deduplicated)
**Phase 3: Plugin Installation** - Plugins perform their specific installation work

```typescript
import {
  collectPluginInstances,
  loadPlugins,
  buildPluginGraph,
  runDetect,
  runApply,
  runValidate,
  runDiff,
  TaskRegistry,
} from "@genesis/core";

// Collect all plugin instances from config
const instances = collectPluginInstances(config);

// Load plugin implementations
const plugins = await loadPlugins(instances);

// Build dependency graph
const graph = buildPluginGraph(plugins);

// Create task registry for deduplication
const taskRegistry = new TaskRegistry(logger);

// Create context with task registry
const context = {
  cwd: process.cwd(),
  env: process.env,
  logger,
  taskRegistry,
};

// Execute plugin methods
const detectResults = await runDetect(graph, context);
const applyResults = await runApply(graph, context);  // Three-phase execution!
const validateResults = await runValidate(graph, context);
const diffResults = await runDiff(graph, context);
```

### Task Registry & Deduplication

Located in `src/execution/`, provides task deduplication and batching.

#### Why Task Registry?

**Problem**: When installing multiple plugins (e.g., Node.js and Python), each plugin would independently run `apt-get update`, causing the same command to execute multiple times unnecessarily.

**Solution**: The Task Registry deduplicates system-level operations across all plugins, running each unique task only once.

#### Task Registry

```typescript
import { TaskRegistry } from "@genesis/core";

const taskRegistry = new TaskRegistry(logger);

// Register tasks (will be deduplicated by ID)
taskRegistry.register({
  id: "linux:package-manager:apt-update",
  description: "Update APT package index",
  executor: async () => {
    await runCommand("sudo", ["apt-get", "update"], { cwd, env });
  },
  priority: 100,
});

// Execute all registered tasks (deduplicated)
const results = await taskRegistry.executeAll();
```

#### System Task Helpers

Pre-built helpers for common system operations:

```typescript
import {
  createPackageManagerUpdateTask,
  createPackageInstallTask,
  createCommandCheckTask,
  createCustomTask,
} from "@genesis/core";

// Package manager update (deduplicated across plugins)
const updateTask = createPackageManagerUpdateTask(cwd, env);
taskRegistry.register(updateTask);

// System package installation
const curlTask = createPackageInstallTask("curl", cwd, env);
taskRegistry.register(curlTask);

// Command availability check
const checkTask = createCommandCheckTask("git", cwd, env);
taskRegistry.register(checkTask);

// Custom task
const customTask = createCustomTask(
  "custom:my-operation",
  "My custom operation",
  async () => {
    // Your custom logic
  },
  { priority: 50 }
);
taskRegistry.register(customTask);
```

#### Using Task Registry in Plugins

```typescript
export function createPlugin(instance): GenesisPlugin {
  return {
    id: instance.id,
    category: instance.category,

    // Phase 1: Register system-level tasks
    async registerTasks(runtime) {
      const { taskRegistry } = runtime.context;

      // Register package manager update (deduplicated!)
      taskRegistry.register(
        createPackageManagerUpdateTask(
          runtime.context.cwd,
          runtime.context.env
        )
      );

      // Register system package installation
      taskRegistry.register(
        createPackageInstallTask(
          "curl",
          runtime.context.cwd,
          runtime.context.env
        )
      );
    },

    // Phase 3: Perform plugin-specific installation
    async apply(runtime) {
      // System packages are now available
      // Perform plugin-specific installation
      return { ok: true, didChange: true };
    },
  };
}
```

**See [Task Deduplication Documentation](../../docs/TASK_DEDUPLICATION.md) for complete details.**

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

// Task Registry & Deduplication
export { TaskRegistry } from "./execution/task-registry.js";
export {
  createPackageManagerUpdateTask,
  createPackageInstallTask,
  createCommandCheckTask,
  createCustomTask,
} from "./execution/system-tasks.js";
export type {
  Task,
  TaskId,
  TaskExecutor,
  TaskResult,
  TaskStatus,
} from "./execution/task-registry.js";

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
  TaskRegistry,
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

// Create task registry for deduplication
const taskRegistry = new TaskRegistry(logger);

// Execute plugins with three-phase execution
const results = await runApply(graph, {
  cwd: process.cwd(),
  env: process.env,
  logger,
  taskRegistry,  // Task registry enables deduplication
});

// Process results
results.forEach((result) => {
  console.log(`${result.id}: ${result.ok ? "✓" : "✗"} ${result.details}`);
});
```

### Using Task Registry for Optimization

```typescript
import {
  TaskRegistry,
  createPackageManagerUpdateTask,
  createPackageInstallTask,
  Logger,
} from "@genesis/core";

const logger = new Logger({ level: "info" });
const taskRegistry = new TaskRegistry(logger);

// Multiple plugins can register the same task
// It will only execute once!

// Plugin 1 registers apt-get update
taskRegistry.register(
  createPackageManagerUpdateTask(process.cwd(), process.env)
);

// Plugin 2 also registers apt-get update (deduplicated!)
taskRegistry.register(
  createPackageManagerUpdateTask(process.cwd(), process.env)
);

// Plugin 1 needs curl
taskRegistry.register(
  createPackageInstallTask("curl", process.cwd(), process.env)
);

// Plugin 2 needs python
taskRegistry.register(
  createPackageInstallTask("python3", process.cwd(), process.env)
);

// Execute all tasks (apt-get update runs only ONCE!)
const results = await taskRegistry.executeAll();

console.log("Task execution complete!");
// Output:
// ✓ Update APT package index (runs once)
// ✓ Install curl via APT
// ✓ Install python3 via APT
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
│   ├── executor.ts   # Three-phase execution
│   ├── loader.ts
│   └── types.ts
├── execution/        # Task registry & deduplication (NEW!)
│   ├── task-registry.ts
│   └── system-tasks.ts
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
