# @genesis/cli

> Command-line interface for Genesis environment provisioning

The Genesis CLI provides a simple, powerful interface for managing your development environment through declarative configuration files.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Commands](#commands)
  - [init](#genesis-init)
  - [apply](#genesis-apply)
  - [diff](#genesis-diff)
  - [validate](#genesis-validate)
  - [doctor](#genesis-doctor)
  - [list-plugins](#genesis-list-plugins)
- [Configuration Files](#configuration-files)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Contributing](#contributing)

---

## Overview

The Genesis CLI is the primary interface for interacting with Genesis. It reads your configuration file (`genesis.config.yaml` or `genesis.config.ts`) and executes the necessary operations to provision your development environment.

---

## Installation

### Global Installation

```bash
# Using npm
npm install -g @genesis/cli

# Using bun
bun install -g @genesis/cli

# Using yarn
yarn global add @genesis/cli
```

### Local Installation (for development)

```bash
# Clone the repository
git clone https://github.com/your-org/genesis.git
cd genesis

# Install dependencies
bun install

# Build the CLI
bun run build

# Link for local development
cd apps/cli
npm link
```

---

## Commands

### `genesis init`

Initialize a new Genesis configuration file in the current directory.

**Usage:**
```bash
genesis init [options]
```

**Options:**
- `--typescript` - Create a TypeScript config file (`genesis.config.ts`)
- `--yaml` - Create a YAML config file (`genesis.config.yaml`) (default)

**Examples:**
```bash
# Create YAML config (default)
genesis init

# Create TypeScript config
genesis init --typescript
```

**What it does:**
1. Checks if a config file already exists
2. Prompts for configuration options (interactive)
3. Creates the config file with sensible defaults
4. Provides next steps

---

### `genesis apply`

Apply the configuration: install tools, clone repositories, run scripts.

**Usage:**
```bash
genesis apply [options]
```

**Options:**
- `--config <path>` - Path to config file (default: auto-detect)
- `--verbose` - Enable verbose logging
- `--dry-run` - Show what would be done without making changes

**Examples:**
```bash
# Apply default config
genesis apply

# Apply specific config
genesis apply --config ./custom-genesis.config.yaml

# Verbose output
genesis apply --verbose

# Dry run (preview changes)
genesis apply --dry-run
```

**What it does:**
1. Loads configuration file
2. Collects all plugin instances
3. Loads plugin implementations
4. Builds dependency graph
5. Executes plugins in correct order:
   - Detects current state
   - Applies changes if needed
   - Validates installation
6. Reports results

**Output:**
```
🚀 Genesis Apply

📦 Loading configuration...
✓ Configuration loaded: genesis.config.yaml

🔍 Detecting current state...
  ✓ node: Node.js v20.10.0 is installed

🔧 Applying changes...
  ⏭  node: Already at correct version, skipping

✅ Apply complete!

Summary:
  ✓ 1 plugin(s) succeeded
  ✗ 0 plugin(s) failed
  ⏭  0 plugin(s) skipped
```

---

### `genesis diff`

Show what would change if you ran `apply` (dry run).

**Usage:**
```bash
genesis diff [options]
```

**Options:**
- `--config <path>` - Path to config file (default: auto-detect)

**Examples:**
```bash
# Show diff for default config
genesis diff

# Show diff for specific config
genesis diff --config ./custom-genesis.config.yaml
```

**What it does:**
1. Loads configuration
2. Detects current state
3. Compares with desired state
4. Shows what would change (without making changes)

**Output:**
```
🔍 Genesis Diff

📦 Loading configuration...
✓ Configuration loaded: genesis.config.yaml

🔍 Analyzing changes...

Changes that would be applied:

  node:
    Current:  Not installed
    Desired:  v20.10.0
    Action:   Install Node.js v20 via NVM

Summary:
  1 change(s) would be applied
```

---

### `genesis validate`

Validate that the current environment matches the configuration.

**Usage:**
```bash
genesis validate [options]
```

**Options:**
- `--config <path>` - Path to config file (default: auto-detect)
- `--verbose` - Enable verbose logging

**Examples:**
```bash
# Validate default config
genesis validate

# Validate specific config
genesis validate --config ./custom-genesis.config.yaml

# Verbose output
genesis validate --verbose
```

**What it does:**
1. Loads configuration
2. Validates each plugin
3. Reports validation results

**Output:**
```
✅ Genesis Validate

📦 Loading configuration...
✓ Configuration loaded: genesis.config.yaml

🔍 Validating environment...
  ✓ node: Node.js v20.10.0 is correctly installed

✅ Validation complete!

Summary:
  ✓ 1 plugin(s) valid
  ✗ 0 plugin(s) invalid
```

---

### `genesis doctor`

Run diagnostics to check for issues and provide recommendations.

**Usage:**
```bash
genesis doctor [options]
```

**Options:**
- `--config <path>` - Path to config file (default: auto-detect)
- `--verbose` - Enable verbose logging

**Examples:**
```bash
# Run diagnostics
genesis doctor

# Verbose output
genesis doctor --verbose
```

**What it does:**
1. Checks for common issues
2. Validates configuration file
3. Checks plugin availability
4. Verifies system requirements
5. Provides recommendations

**Output:**
```
🏥 Genesis Doctor

📦 Configuration
  ✓ Config file found: genesis.config.yaml
  ✓ Config file is valid

🔌 Plugins
  ✓ All plugins are available
  ✓ No dependency conflicts

💻 System
  ✓ Platform: macOS (darwin)
  ✓ Shell: zsh
  ✓ Internet connection: OK

✅ No issues found!
```

---

### `genesis list-plugins`

List all available plugins and their options.

**Usage:**
```bash
genesis list-plugins [options]
```

**Options:**
- `--category <category>` - Filter by category (tool, sdk, language)
- `--verbose` - Show detailed information

**Examples:**
```bash
# List all plugins
genesis list-plugins

# List only tool plugins
genesis list-plugins --category tool

# Verbose output
genesis list-plugins --verbose
```

**Output:**
```
📦 Available Plugins

Tools:
  node - Node.js runtime
    Options:
      version (string, required): Node.js version to install
      use_nvm (boolean, optional): Use NVM for installation (default: true)

SDKs:
  (Coming soon)

Languages:
  (Coming soon)
```

---

## Configuration Files

Genesis supports two configuration formats:

### YAML (`genesis.config.yaml`)

```yaml
tools:
  - type: node
    version: "20"
    use_nvm: true

repositories:
  - url: https://github.com/example/backend
    path: ./backend
    branch: main

scripts:
  - name: install-dependencies
    command: npm install
    when: after

env:
  NODE_ENV: development
  API_URL: http://localhost:3000
```

### TypeScript (`genesis.config.ts`)

```typescript
import { defineConfig } from "@genesis/core";
import { node } from "@genesis/plugins";

export default defineConfig({
  tools: [
    node({
      version: "20",
      use_nvm: true,
    }),
  ],
  repositories: [
    {
      url: "https://github.com/example/backend",
      path: "./backend",
      branch: "main",
    },
  ],
  scripts: [
    {
      name: "install-dependencies",
      command: "npm install",
      when: "after",
    },
  ],
  env: {
    NODE_ENV: "development",
    API_URL: "http://localhost:3000",
  },
});
```

---

## Usage Examples

### Complete Workflow

```bash
# 1. Initialize a new project
cd my-project
genesis init

# 2. Edit the generated config file
# (Add your tools, repositories, etc.)

# 3. Preview changes
genesis diff

# 4. Apply configuration
genesis apply

# 5. Validate environment
genesis validate

# 6. Run diagnostics if issues occur
genesis doctor
```

### Team Onboarding

```bash
# New team member clones the repository
git clone https://github.com/company/project.git
cd project

# Genesis config is already in the repo
# Just apply it!
genesis apply

# Done! Environment is ready
```

### Updating Tools

```bash
# Edit genesis.config.yaml to update Node.js version
# Change: version: "18" -> version: "20"

# Preview changes
genesis diff

# Apply update
genesis apply

# Verify
node --version  # Should show v20.x.x
```

---

## Development

### Building

```bash
# Build the CLI
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
├── commands/         # CLI command implementations
│   ├── apply.ts
│   ├── create.ts
│   ├── diff.ts
│   ├── doctor.ts
│   ├── init.ts
│   ├── list-plugins.ts
│   └── validate.ts
├── lib/              # CLI utilities
│   └── runner.ts
└── index.ts          # CLI entry point
```

---

## Contributing

Contributions are welcome! Please see the [main repository](../../README.md) for contribution guidelines.

---

**Part of the [Genesis](../../README.md) project**
