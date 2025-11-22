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
- **Installation**: Install the tool if missing or upgrade if needed
- **Validation**: Verify the installation is correct and functional
- **Cross-Platform Support**: Works on macOS, Linux, and Windows

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

Coming soon:
- Python
- Go
- Rust
- Ruby

---

## Plugin Architecture

All Genesis plugins follow a consistent architecture:

### Plugin Interface

```typescript
interface GenesisPlugin<TOptions = unknown> {
  id: string;
  category: "tool" | "sdk" | "language";
  dependsOn?: string[];
  
  detect?(runtime: PluginRuntime<TOptions>): Promise<DetectResult>;
  apply?(runtime: PluginRuntime<TOptions>): Promise<ApplyResult>;
  validate?(runtime: PluginRuntime<TOptions>): Promise<ValidateResult>;
}
```

### Plugin Lifecycle

1. **Detect**: Check if the tool is installed and at the correct version
2. **Apply**: Install or update the tool if needed
3. **Validate**: Verify the installation is correct

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
import { getPlatform, runCommand } from "@genesis/core";

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

export const myToolPlugin: GenesisPlugin<MyToolOptions> = {
  id: "my-tool",
  category: "tool",
  
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
  
  async apply(runtime: PluginRuntime<MyToolOptions>): Promise<ApplyResult> {
    const { options, context } = runtime;
    const { logger } = context;
    const platform = getPlatform();
    
    logger.info(`Installing my-tool ${options.version}...`);
    
    // Platform-specific installation logic
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
```

### 3. Export Plugin

Add to `packages/plugins/src/index.ts`:

```typescript
export { myTool, myToolPlugin } from "./plugins/my-tool/index.js";
export type { MyToolOptions } from "./plugins/my-tool/index.js";
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

- [ ] Implement plugin interface (`detect`, `apply`, `validate`)
- [ ] Add comprehensive error handling and logging
- [ ] Support all platforms (macOS, Linux, Windows)
- [ ] Create detailed plugin README
- [ ] Add usage examples (TypeScript and YAML)
- [ ] Write tests
- [ ] Update this README with plugin link

---

**Part of the [Genesis](../../README.md) project**
