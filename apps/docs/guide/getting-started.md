# Getting Started

This guide will help you install Genesis and create your first environment configuration.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **Bun** or **npm** package manager
- **Git** (optional, for cloning examples)

## Installation

### Using Bun (Recommended)

```bash
bun add -D @genesis/core @genesis/plugins @genesis/cli
```

### Using npm

```bash
npm install --save-dev @genesis/core @genesis/plugins @genesis/cli
```

### Using pnpm

```bash
pnpm add -D @genesis/core @genesis/plugins @genesis/cli
```

## Project Setup

### 1. Initialize Your Project

If you don't have a project yet:

```bash
mkdir my-project
cd my-project
bun init -y  # or npm init -y
```

### 2. Install Genesis

```bash
bun add -D @genesis/core @genesis/plugins @genesis/cli
```

### 3. Create Configuration File

Create a `genesis.config.ts` file in your project root:

::: code-group

```typescript [genesis.config.ts]
import { defineConfig } from "@genesis/core";
import { node } from "@genesis/plugins";

export default defineConfig({
  tools: [
    node({
      version: "20",
      use_nvm: true,
    }),
  ],
});
```

```yaml [genesis.yaml]
tools:
  - type: node
    version: "20"
    use_nvm: true
```

:::

::: tip
TypeScript configuration is recommended for type safety and autocomplete support!
:::

### 4. Add Scripts to package.json

```json
{
  "scripts": {
    "genesis:apply": "genesis apply",
    "genesis:detect": "genesis detect"
  }
}
```

### 5. Run Genesis

```bash
# Detect current environment
bun run genesis:detect

# Apply configuration
bun run genesis:apply
```

## Your First Configuration

Let's create a more complete configuration:

```typescript
import { defineConfig } from "@genesis/core";
import { node, python } from "@genesis/plugins";

export default defineConfig({
  // Development tools
  tools: [
    node({
      version: "20",
      use_nvm: true,  // Use NVM for version management
    }),
  ],
  
  // Programming languages
  languages: [
    python({
      version: "3.11",
    }),
  ],
});
```

## Understanding the Output

When you run `genesis apply`, you'll see output like this:

```
Phase 1: Registering tasks...
  ℹ node: Registered system tasks for NVM prerequisites
  ℹ python: Registered system tasks for Python installation

Phase 2: Executing system tasks...
  ✓ Update APT package index (deduplicated)
  ✓ Install curl
  ✓ Install python3.11

Phase 3: Installing plugins...
  ℹ node: Installing NVM...
  ✓ node: NVM installed successfully
  ✓ node: Node.js 20 installed via NVM
  ✓ python: Python 3.11 verified

✅ Environment setup complete!
```

### What Just Happened?

1. **Phase 1**: Both plugins registered their system requirements
   - Node.js plugin: needs `apt-get update` and `curl`
   - Python plugin: needs `apt-get update` and `python3.11`

2. **Phase 2**: System tasks executed (deduplicated)
   - `apt-get update` ran **once** (not twice!)
   - `curl` and `python3.11` installed

3. **Phase 3**: Plugins completed their installation
   - NVM downloaded and installed using `curl`
   - Node.js 20 installed via NVM
   - Python 3.11 verified

## CLI Commands

### `genesis detect`

Check what's currently installed:

```bash
genesis detect
```

Output:
```
Detecting environment...
  ✓ node: Node.js 20.10.0 is installed
  ✗ python: Python is not installed
```

### `genesis apply`

Install and configure everything:

```bash
genesis apply
```

Options:
```bash
# Use specific config file
genesis apply -c custom-config.ts

# Dry run (show what would be installed)
genesis apply --dry-run

# Verbose output
genesis apply --verbose
```

### `genesis validate`

Verify installations:

```bash
genesis validate
```

## Configuration Formats

Genesis supports both TypeScript and YAML configurations:

### TypeScript (Recommended)

**Advantages:**
- ✅ Type safety and autocomplete
- ✅ Programmatic configuration
- ✅ Import and reuse configs
- ✅ Better IDE support

```typescript
import { defineConfig } from "@genesis/core";
import { node, python } from "@genesis/plugins";

export default defineConfig({
  tools: [node({ version: "20", use_nvm: true })],
  languages: [python({ version: "3.11" })],
});
```

### YAML

**Advantages:**
- ✅ Simple and readable
- ✅ No build step needed
- ✅ Easy for non-developers

```yaml
tools:
  - type: node
    version: "20"
    use_nvm: true

languages:
  - type: python
    version: "3.11"
```

## Platform-Specific Behavior

Genesis automatically detects your platform and uses the appropriate package manager:

### macOS
- Uses **Homebrew** for system packages
- Downloads installers from official sources
- Integrates with shell profiles

### Linux
- Uses **APT** (Debian/Ubuntu)
- Uses **YUM/DNF** (RedHat/Fedora)
- Detects distribution automatically

### Windows
- Provides installation guides
- Links to official installers
- Future: Automated installation support

## Next Steps

Now that you have Genesis installed:

1. [Learn about Configuration](/guide/configuration) - Understand all configuration options
2. [Explore Plugins](/plugins/overview) - See what plugins are available
3. [Understand Task Registry](/guide/task-registry) - Learn how deduplication works
4. [Create a Plugin](/guide/plugin-development) - Build your own plugin

## Troubleshooting

### Command not found: genesis

Make sure you've installed the CLI package:

```bash
bun add -D @genesis/cli
```

And you're running via package.json scripts or using `bunx`:

```bash
bunx genesis apply
```

### Permission errors on Linux

Some operations require sudo. Genesis will prompt when needed:

```bash
# Run with sudo if needed
sudo bun run genesis:apply
```

### TypeScript errors

Ensure you have TypeScript installed:

```bash
bun add -D typescript
```

### Need Help?

- [Troubleshooting Guide](/guide/troubleshooting)
- [GitHub Issues](https://github.com/Mohammed-Aman-Khan/genesis/issues)
- [Contributing Guide](/guide/contributing)

