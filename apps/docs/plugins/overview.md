# Plugin Overview

Genesis uses a plugin-based architecture to support different tools, languages, and SDKs.

## Available Plugins

### Tools

Development tools and utilities:

| Plugin | Description | Platforms | Status |
|--------|-------------|-----------|--------|
| [Node.js](/plugins/node) | Node.js runtime with NVM support | macOS, Linux, Windows | ✅ Stable |

### Languages

Programming language runtimes:

| Plugin | Description | Platforms | Status |
|--------|-------------|-----------|--------|
| [Python](/plugins/python) | Python runtime via system package manager | macOS, Linux, Windows | ✅ Stable |

### SDKs

Software development kits (coming soon):

| Plugin | Description | Platforms | Status |
|--------|-------------|-----------|--------|
| AWS SDK | AWS CLI and SDKs | All | 🚧 Planned |
| Google Cloud SDK | gcloud CLI and SDKs | All | 🚧 Planned |

## Plugin Features

All Genesis plugins provide:

### ✅ Cross-Platform Support

Plugins work across macOS, Linux, and Windows with platform-specific implementations.

### ✅ Automatic Detection

Plugins detect existing installations and skip unnecessary work:

```bash
$ genesis detect
Detecting environment...
  ✓ node: Node.js 20.10.0 is installed
  ✗ python: Python is not installed
```

### ✅ Task Deduplication

Plugins use the task registry to eliminate redundant operations:

```typescript
// Both plugins register apt-update, but it runs only once!
export default defineConfig({
  tools: [node({ version: "20", use_nvm: true })],
  languages: [python({ version: "3.11" })],
});
```

### ✅ Comprehensive Logging

Detailed output at every step:

```
Phase 1: Registering tasks...
  ℹ node: Registered system tasks
  ℹ python: Registered system tasks

Phase 2: Executing system tasks...
  ✓ Update APT package index (deduplicated)
  ✓ Install curl
  ✓ Install python3.11

Phase 3: Installing plugins...
  ✓ node: NVM installed successfully
  ✓ python: Python 3.11 verified
```

### ✅ Idempotent Operations

Run Genesis multiple times safely - it only installs what's missing.

## Plugin Lifecycle

Each plugin goes through a four-phase lifecycle:

### 1. Detection

Check if the tool is already installed:

```typescript
async detect(runtime): Promise<DetectResult> {
  // Check if tool exists and version matches
  return {
    ok: true,
    details: "Node.js 20.10.0 is installed",
  };
}
```

### 2. Task Registration

Register system-level prerequisites:

```typescript
async registerTasks(runtime): Promise<void> {
  // Register package manager updates, system packages
  taskRegistry.register(
    createPackageManagerUpdateTask(cwd, env)
  );
}
```

### 3. Installation

Perform plugin-specific installation:

```typescript
async apply(runtime): Promise<ApplyResult> {
  // Install the tool (system dependencies already available)
  return {
    ok: true,
    details: "Node.js 20 installed successfully",
  };
}
```

### 4. Validation

Verify the installation:

```typescript
async validate(runtime): Promise<ValidateResult> {
  // Verify tool is installed and working
  return this.detect(runtime);
}
```

## Using Plugins

### TypeScript Configuration

```typescript
import { defineConfig } from "@genesis/core";
import { node, python } from "@genesis/plugins";

export default defineConfig({
  tools: [
    node({
      version: "20",
      use_nvm: true,
    }),
  ],
  languages: [
    python({
      version: "3.11",
    }),
  ],
});
```

### YAML Configuration

```yaml
tools:
  - type: node
    version: "20"
    use_nvm: true

languages:
  - type: python
    version: "3.11"
```

## Plugin Categories

### Tools

Development tools and utilities:

```typescript
export default defineConfig({
  tools: [
    node({ version: "20", use_nvm: true }),
    // More tools coming soon
  ],
});
```

### Languages

Programming language runtimes:

```typescript
export default defineConfig({
  languages: [
    python({ version: "3.11" }),
    // More languages coming soon
  ],
});
```

### SDKs

Software development kits:

```typescript
export default defineConfig({
  sdks: [
    // Coming soon
  ],
});
```

## Plugin Options

Each plugin has its own configuration options:

### Node.js Plugin

```typescript
interface NodeOptions {
  version: string;      // Required: Node.js version
  use_nvm?: boolean;    // Optional: Use NVM (default: true)
}
```

[Full Node.js documentation →](/plugins/node)

### Python Plugin

```typescript
interface PythonOptions {
  version: string;      // Required: Python version
}
```

[Full Python documentation →](/plugins/python)

## Creating Custom Plugins

Want to create your own plugin? Check out:

- [Plugin Development Guide](/guide/plugin-development)
- [Creating a Plugin](/plugins/creating-plugin)
- [Best Practices](/plugins/best-practices)

## Plugin Ecosystem

### Official Plugins

Maintained by the Genesis team:
- ✅ Node.js
- ✅ Python
- 🚧 More coming soon

### Community Plugins

Coming soon! We'll support community-contributed plugins.

### Enterprise Plugins

Need a custom plugin for your organization? [Contact us](https://github.com/Mohammed-Aman-Khan/genesis/issues).

## Platform Support

### macOS

- ✅ Homebrew integration
- ✅ Native installers
- ✅ Shell profile integration

### Linux

- ✅ APT (Debian/Ubuntu)
- ✅ YUM/DNF (RedHat/Fedora)
- ✅ Automatic distro detection

### Windows

- ⚠️ Manual installation guides (current)
- 🚧 Chocolatey support (planned)
- 🚧 Automated installation (planned)

## What's Next?

Explore specific plugins:

- [Node.js Plugin](/plugins/node) - Install Node.js with NVM
- [Python Plugin](/plugins/python) - Install Python runtime

Or learn to create your own:

- [Plugin Development](/guide/plugin-development) - Build custom plugins
- [Plugin Lifecycle](/plugins/lifecycle) - Understand the plugin lifecycle
- [Best Practices](/plugins/best-practices) - Plugin development best practices

