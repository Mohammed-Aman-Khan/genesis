# @genesis/plugins

> Official plugin collection for Genesis

This package contains the official plugins for Genesis, providing support for various development tools, SDKs, and programming languages.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Available Plugins](#available-plugins)
  - [Tools](#tools)
  - [SDKs](#sdks)
  - [Languages](#languages)
- [Plugin Architecture](#plugin-architecture)
- [Creating a Plugin](#creating-a-plugin)
- [Development](#development)
- [Contributing](#contributing)

---

## Overview

`@genesis/plugins` provides a collection of ready-to-use plugins for common development tools and environments. Each plugin handles:

- **Detection**: Check if the tool is already installed and at the correct version
- **Task Registration**: Register system-level prerequisites (deduplicated across plugins)
- **Installation**: Install the tool if missing or upgrade if needed
- **Validation**: Verify the installation is correct and functional
- **Cross-Platform Support**: Works on macOS, Linux, and Windows
- **Optimized Execution**: Three-phase execution eliminates redundant system operations

---

## Installation

```bash
# Using npm
npm install @genesis/plugins

# Using bun
bun add @genesis/plugins

# Using yarn
yarn add @genesis/plugins
```

---

## Available Plugins

### Tools

#### [Node.js](./src/plugins/node/README.md)

Install and manage Node.js runtime.

**Features:**
- NVM installation (default, recommended)
- Standalone installation (optional)
- Cross-platform support (macOS, Linux, Windows)
- Automatic version management
- Shell profile integration

**Usage:**

```typescript
import { node } from "@genesis/plugins";

export default defineConfig({
  tools: [
    node({
      version: "20",
      use_nvm: true,  // Default: true
    }),
  ],
});
```

```yaml
tools:
  - type: node
    version: "20"
    use_nvm: true  # Default: true
```

**Options:**
- `version` (string, required): Node.js version to install (e.g., "20", "18.16.0")
- `use_nvm` (boolean, optional): Use NVM for installation (default: `true`)

**See [Node Plugin Documentation](./src/plugins/node/README.md) for details.**

---

### SDKs

Coming soon:
- Java JDK
- .NET SDK
- Android SDK
- iOS SDK

---

### Languages

#### [Python](./src/plugins/python/index.ts)

Install and manage Python runtime.

**Features:**
- System package manager installation
- Cross-platform support (macOS, Linux, Windows)
- Automatic version management
- Task deduplication (package manager updates run only once)

**Usage:**

```typescript
import { python } from "@genesis/plugins";

export default defineConfig({
  languages: [
    python({
      version: "3.11",
    }),
  ],
});
```

```yaml
languages:
  - type: python
    version: "3.11"
```

**Options:**
- `version` (string, required): Python version to install (e.g., "3.11", "3.10")

---

Coming soon:
- Go
- Rust
- Ruby

---

## Plugin Architecture

All Genesis plugins follow a consistent architecture with **three-phase execution** for optimal performance.

### Plugin Interface

```typescript
interface GenesisPlugin<TOptions = unknown> {
  id: string;
  category: "tool" | "sdk" | "language";
  dependsOn?: string[];

  detect?(runtime: PluginRuntime<TOptions>): Promise<DetectResult>;
  registerTasks?(runtime: PluginRuntime<TOptions>): Promise<void>;  // NEW!
  apply?(runtime: PluginRuntime<TOptions>): Promise<ApplyResult>;
  validate?(runtime: PluginRuntime<TOptions>): Promise<ValidateResult>;
}
```

### Three-Phase Execution Model

Genesis uses a three-phase execution model to eliminate redundant system operations:

#### Phase 1: Task Registration (`registerTasks`)
- Plugins register system-level prerequisites
- Tasks are collected but not executed yet
- Example: Register `apt-get update`, `apt-get install curl`

#### Phase 2: Task Execution
- Task registry executes all registered tasks
- **Automatic deduplication** - each task runs only once
- Tasks execute in dependency order
- Example: `apt-get update` runs once, then `curl` and `python3` install

#### Phase 3: Plugin Installation (`apply`)
- Plugins perform their specific installation work
- System dependencies are guaranteed to be available
- Example: NVM installation using curl (which is now installed)

**Benefits:**
- **50% fewer package manager updates** - `apt-get update` runs once, not per plugin
- **Guaranteed dependencies** - System packages available when plugins need them
- **Better performance** - No redundant operations
- **Scalable** - Works with any number of plugins

### Plugin Lifecycle

1. **Detect**: Check if the tool is installed and at the correct version
2. **Register Tasks** (Phase 1): Register system-level prerequisites
3. **Execute Tasks** (Phase 2): System tasks execute once (deduplicated)
4. **Apply** (Phase 3): Install or update the tool
5. **Validate**: Verify the installation is correct

### Plugin Runtime

Each plugin method receives a runtime context:

```typescript
interface PluginRuntime<TOptions> {
  instance: GenesisPluginInstance<TOptions>;
  options: TOptions;
  context: GenesisPluginContext;
}

interface GenesisPluginContext {
  cwd: string;
  env: NodeJS.ProcessEnv;
  logger: Logger;
  taskRegistry: TaskRegistry;  // NEW! For task deduplication
}
```

---

## Creating a Plugin

### 1. Create Plugin Directory

```bash
mkdir -p packages/plugins/src/plugins/my-tool
```

### 2. Implement Plugin

Create `packages/plugins/src/plugins/my-tool/index.ts`:

```typescript
import type {
  GenesisPlugin,
  GenesisPluginInstance,
  PluginRuntime,
  DetectResult,
  ApplyResult,
  ValidateResult,
} from "@genesis/core";
import {
  getPlatform,
  runCommand,
  createPackageManagerUpdateTask,
  createPackageInstallTask,
} from "@genesis/core";

export interface MyToolOptions {
  version: string;
  // Add your options here
}

export function myTool(options: MyToolOptions): GenesisPluginInstance<MyToolOptions> {
  return {
    id: "my-tool",
    category: "tool",
    module: "@genesis/plugins/my-tool",
    options,
  };
}

export function createPlugin(
  instance: GenesisPluginInstance<MyToolOptions>
): GenesisPlugin<MyToolOptions> {
  return {
    id: instance.id,
    category: instance.category,

    async detect(runtime: PluginRuntime<MyToolOptions>): Promise<DetectResult> {
      const { options, context } = runtime;
      const { logger } = context;

      logger.debug("Detecting my-tool...");

      try {
        const result = await runCommand("my-tool", ["--version"], {
          cwd: context.cwd,
          env: context.env,
        });

        if (result.code === 0) {
          const installedVersion = result.stdout.trim();
          const isCorrectVersion = installedVersion.includes(options.version);

          return {
            ok: isCorrectVersion,
            details: isCorrectVersion
              ? `my-tool ${installedVersion} is installed`
              : `my-tool ${installedVersion} found, but ${options.version} required`,
          };
        }
      } catch (error) {
        logger.debug("my-tool not found");
      }

      return {
        ok: false,
        details: "my-tool is not installed",
      };
    },

    // Phase 1: Register system-level tasks
    async registerTasks(runtime: PluginRuntime<MyToolOptions>): Promise<void> {
      const { taskRegistry, logger } = runtime.context;
      const platform = getPlatform();

      // Skip Windows (manual installation)
      if (platform === "windows") {
        return;
      }

      logger.debug("Registering system tasks for my-tool");

      // Register package manager update (deduplicated across plugins!)
      taskRegistry.register(
        createPackageManagerUpdateTask(
          runtime.context.cwd,
          runtime.context.env
        )
      );

      // Register any system packages your tool needs
      taskRegistry.register(
        createPackageInstallTask(
          "build-essential",  // Example dependency
          runtime.context.cwd,
          runtime.context.env
        )
      );
    },

    // Phase 3: Perform plugin-specific installation
    async apply(runtime: PluginRuntime<MyToolOptions>): Promise<ApplyResult> {
      const { options, context } = runtime;
      const { logger } = context;
      const platform = getPlatform();

      logger.info(`Installing my-tool ${options.version}...`);

      // System packages are now available (from Phase 2)
      // Perform plugin-specific installation
      if (platform === "windows") {
        // Windows installation
      } else {
        // macOS/Linux installation
      }

      return {
        ok: true,
        details: `my-tool ${options.version} installed successfully`,
      };
    },

    async validate(runtime: PluginRuntime<MyToolOptions>): Promise<ValidateResult> {
      // Reuse detect logic
      return this.detect!(runtime);
    },
  };
}

export const myToolPlugin = createPlugin;
```

### 3. Export Plugin

Add to `packages/plugins/src/index.ts`:

```typescript
export { myTool, createPlugin as createMyToolPlugin } from "./plugins/my-tool/index.js";
export type { MyToolOptions } from "./plugins/my-tool/index.js";
```

Update `packages/plugins/package.json` exports:

```json
{
  "exports": {
    "./my-tool": {
      "import": "./dist/plugins/my-tool/index.js",
      "types": "./dist/plugins/my-tool/index.d.ts"
    }
  }
}
```

Update build script in `packages/plugins/package.json`:

```json
{
  "scripts": {
    "build": "tsup src/index.ts src/plugins/node/index.ts src/plugins/python/index.ts src/plugins/my-tool/index.ts --dts --format esm --minify"
  }
}
```

### 4. Create Plugin README

Create `packages/plugins/src/plugins/my-tool/README.md` with:
- Overview
- Installation
- Configuration options
- Usage examples
- Platform-specific notes
- Troubleshooting

### 5. Update Plugins README

Add link to your plugin in this README's [Available Plugins](#available-plugins) section.

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
├── plugins/
│   ├── node/
│   │   ├── index.ts
│   │   └── README.md
│   ├── my-tool/
│   │   ├── index.ts
│   │   └── README.md
│   └── ...
└── index.ts
```

---

## Contributing

We welcome new plugins! Please see the [main repository](../../README.md) for contribution guidelines.

### Plugin Contribution Checklist

- [ ] Implement plugin interface (`detect`, `registerTasks`, `apply`, `validate`)
- [ ] Use task registry for system-level operations (package manager updates, system packages)
- [ ] Add comprehensive error handling and logging
- [ ] Support all platforms (macOS, Linux, Windows)
- [ ] Create detailed plugin README
- [ ] Add usage examples (TypeScript and YAML)
- [ ] Write tests
- [ ] Update this README with plugin link
- [ ] Update package.json exports and build script

### Best Practices for Plugin Development

**✅ Use `registerTasks()` for:**
- Package manager operations (`apt update`, `brew update`)
- System package installations (`apt install curl`)
- Global tool installations that require system packages
- Operations that might be needed by multiple plugins

**✅ Use `apply()` for:**
- User-space installations (NVM, pyenv, rbenv)
- Configuration file modifications
- Environment variable setup
- Plugin-specific setup that depends on system packages

**Key principle:** If multiple plugins might need it and it's a system-level operation, use `registerTasks()`. Otherwise, use `apply()`.

---

**Part of the [Genesis](../../README.md) project**
