# Genesis

> **Declarative, cross-platform developer environment provisioning engine**

Genesis empowers development teams to define, version, and automate their entire development environment setup using simple configuration files. Say goodbye to lengthy onboarding docs and "works on my machine" problems.

---

## 📑 Table of Contents

- [What is Genesis?](#what-is-genesis)
- [Why Genesis?](#why-genesis)
  - [The Problem](#the-problem)
  - [The Solution](#the-solution)
  - [Genesis vs Docker](#genesis-vs-docker)
- [Features](#features)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Development Guide](#development-guide)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## What is Genesis?

Genesis is a **declarative environment provisioning engine** that allows you to define your entire development environment as code. Using simple YAML or TypeScript configuration files, Genesis automatically installs and configures:

- **Development tools** (Node.js, Python, Git, etc.)
- **SDKs and frameworks** (Java, .NET, etc.)
- **Programming languages** (Go, Rust, etc.)
- **Git repositories** (clone and organize your projects)
- **Environment variables** (consistent configuration)
- **Setup scripts** (custom initialization logic)

All of this works **cross-platform** (macOS, Linux, Windows) from a single configuration file.

---

## Why Genesis?

### The Problem

Setting up development environments is a major pain point for engineering teams:

- ⏰ **Time-consuming**: New developers spend hours or days setting up their machines
- 🐛 **Error-prone**: Manual steps lead to inconsistencies and "works on my machine" bugs
- 📚 **Undocumented**: Setup knowledge lives in outdated wikis, Slack messages, or people's heads
- �� **Platform-specific**: Different instructions for Mac, Linux, and Windows developers
- 🔧 **Fragile**: Breaks when tools update, OS versions change, or dependencies shift
- 🔄 **Not reproducible**: Hard to recreate exact environments for debugging
- 👥 **Team drift**: Each developer's environment slowly diverges over time

### The Solution

Genesis solves these problems by providing:

- ✅ **Automation**: One command (`genesis apply`) sets up everything
- ✅ **Consistency**: Everyone on the team gets identical environments
- ✅ **Documentation as Code**: Your config file IS the documentation
- ✅ **Cross-Platform**: Same config works on Mac, Linux, and Windows
- ✅ **Reproducibility**: Deterministic, version-controlled setups
- ✅ **Idempotent**: Safe to run multiple times, only applies necessary changes
- ✅ **Fast Onboarding**: New team members productive in minutes, not days
- ✅ **Version Control**: Track environment changes in git alongside code

### Genesis vs Docker

Genesis and Docker solve different problems and complement each other:

| Aspect | Genesis | Docker |
|--------|---------|--------|
| **Purpose** | Native dev environment setup | Containerized runtime environments |
| **Performance** | Native speed, no overhead | Virtualization overhead |
| **IDE Integration** | Full native support | Limited/complex setup required |
| **Debugging** | Native debugging tools | Container debugging (more complex) |
| **File System** | Native file system | Volume mounts (slower on Mac/Windows) |
| **Hot Reload** | Native, instant | Can be slower with volumes |
| **Use Case** | Local development tools & setup | Production-like service isolation |
| **Learning Curve** | Minimal (YAML config) | Moderate to steep (Dockerfiles, compose) |
| **Resource Usage** | Minimal | Higher (containers, images) |
| **Startup Time** | Instant | Container startup time |

#### When to use Genesis:

- 🛠️ Setting up local development environments
- 👋 Onboarding new team members
- 🔧 Installing and managing dev tools (Node, Python, Git, etc.)
- ⚡ When you need native performance
- 🐛 When you need full IDE/debugger integration
- 📦 Managing language runtimes and SDKs

#### When to use Docker:

- 🚀 Production deployments
- 🏗️ Microservices architecture
- 🧪 Isolated service testing
- 🔄 CI/CD pipelines
- 🗄️ Running databases, message queues, caches

#### Use Both Together:

**Genesis and Docker are complementary!** The best setup uses both:

- **Genesis**: Installs your dev tools (Node.js via NVM, Python, Git, IDE extensions, CLI tools)
- **Docker**: Runs your services (PostgreSQL, Redis, Kafka, microservices)

**Example workflow:**
```bash
# Genesis sets up your dev tools
genesis apply

# Docker runs your services
docker-compose up -d

# You develop with native tools against containerized services
npm run dev
```

This gives you the best of both worlds: native development speed with isolated service dependencies.



---

## Features

- 🎯 **Declarative Configuration**: Define your entire dev environment in a single config file
- 🌍 **Cross-Platform**: Works seamlessly on macOS, Linux, and Windows
- 🔌 **Plugin-Based**: Extensible architecture for tools, SDKs, and languages
- 📝 **Version Control**: Track environment changes in git alongside your code
- 👥 **Team Consistency**: Ensure all team members have identical development setups
- 🔄 **Idempotent**: Safe to run multiple times, only applies necessary changes
- 🚀 **Fast**: Intelligent caching and parallel execution
- 🪵 **Comprehensive Logging**: Debug, info, warn, and error levels with color output
- ✅ **Validation**: Verify your environment matches the desired state
- 🔍 **Diff Mode**: Preview changes before applying them

---

## Quick Start

### Installation

```bash
# Using npm
npm install -g @genesis/cli

# Using bun
bun install -g @genesis/cli

# Using yarn
yarn global add @genesis/cli
```

### Initialize a Project

```bash
# Navigate to your project directory
cd my-project

# Create a new genesis.config.yaml
genesis init

# Follow the interactive prompts to configure your environment
```

### Example Configuration

**YAML (`genesis.config.yaml`):**
```yaml
tools:
  - type: node
    version: "20"
    use_nvm: true  # Install via NVM (default)
  
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

**TypeScript (`genesis.config.ts`):**
```typescript
import { defineConfig } from "@genesis/core";
import { node } from "@genesis/plugins";

export default defineConfig({
  tools: [
    node({
      version: "20",
      use_nvm: true,  // Install via NVM (default)
    }),
  ],
  repositories: [
    {
      url: "https://github.com/example/backend",
      path: "./backend",
      branch: "main",
    },
  ],
  env: {
    NODE_ENV: "development",
  },
});
```

### Apply Configuration

```bash
# Install and configure everything
genesis apply

# Check what would change (dry run)
genesis diff

# Validate current environment matches config
genesis validate

# Run diagnostics to check for issues
genesis doctor
```

---

## Usage

### CLI Commands

See [CLI Documentation](./apps/cli/README.md) for detailed command reference.

**Quick reference:**

- `genesis init` - Initialize a new configuration file
- `genesis apply` - Apply the configuration
- `genesis diff` - Show what would change
- `genesis validate` - Validate current environment
- `genesis doctor` - Run diagnostics
- `genesis list-plugins` - List available plugins

### Configuration

Genesis supports both **YAML** and **TypeScript** configuration files:

- `genesis.config.yaml` (recommended for simplicity)
- `genesis.config.ts` (recommended for type safety and IDE autocomplete)

#### Configuration Schema

```yaml
# Development tools (node, python, git, etc.)
tools:
  - type: string          # Plugin type (e.g., "node")
    version: string       # Version to install
    # ... tool-specific options

# SDKs and frameworks (java, dotnet, etc.)
sdks:
  - type: string
    version: string
    # ... SDK-specific options

# Programming languages (go, rust, etc.)
languages:
  - type: string
    version: string
    # ... language-specific options

# Git repositories to clone
repositories:
  - url: string           # Git repository URL
    path: string          # Local path to clone to
    branch?: string       # Branch to checkout (optional)

# Scripts to run during setup
scripts:
  - name: string          # Script name
    command: string       # Command to execute
    when?: "before" | "after"  # When to run (optional)

# Environment variables
env:
  KEY: value              # Environment variable key-value pairs
```

### Available Plugins

#### Tools

- **[node](./packages/plugins/src/plugins/node/README.md)**: Node.js runtime
  - Supports NVM installation (default)
  - Supports standalone installation
  - Cross-platform (macOS, Linux, Windows)

#### SDKs
- Coming soon (Java, .NET, Android SDK, etc.)

#### Languages
- Coming soon (Python, Go, Rust, etc.)

---

## Development Guide

Genesis is built as a **monorepo** using **Turborepo** and **Bun** for fast, efficient development.

### Monorepo Structure

```
genesis/
├── apps/
│   └── cli/                    # Genesis CLI application
│       ├── src/
│       │   ├── commands/       # CLI command implementations
│       │   ├── lib/            # CLI utilities
│       │   └── index.ts        # CLI entry point
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md           # CLI documentation
│
├── packages/
│   ├── core/                   # Core engine and utilities
│   │   ├── src/
│   │   │   ├── config/         # Configuration parsing & validation
│   │   │   ├── plugins/        # Plugin system & executor
│   │   │   ├── os/             # Platform detection & shell commands
│   │   │   ├── fs/             # File system utilities
│   │   │   ├── env/            # Environment variable management
│   │   │   └── utils/          # Logging and other utilities
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md           # Core package documentation
│   │
│   └── plugins/                # Plugin implementations
│       ├── src/
│       │   ├── plugins/
│       │   │   └── node/       # Node.js plugin
│       │   │       ├── index.ts
│       │   │       └── README.md  # Node plugin documentation
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md           # Plugins package documentation
│
├── docs/                       # Additional documentation
├── examples/                   # Example configurations
├── package.json                # Root package.json (workspace config)
├── turbo.json                  # Turborepo configuration
└── README.md                   # This file
```

### Getting Started

#### Prerequisites

- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh))
- **Node.js** >= 18.0.0 (for compatibility testing)
- **Git**

#### Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/genesis.git
cd genesis

# Install dependencies
bun install
```

### Building the Project

```bash
# Build all packages (uses Turborepo for caching and parallelization)
bun run build

# Build a specific package
cd packages/core
bun run build

# Clean all build artifacts
bun run clean
```

The build process:
1. Builds `@genesis/core` first (dependency)
2. Builds `@genesis/plugins` (depends on core)
3. Builds `@genesis/cli` (depends on core and plugins)
4. Uses Turborepo caching for fast rebuilds

### Creating a Plugin

See the [Plugin Development Guide](./docs/PLUGIN_DEVELOPMENT.md) for detailed instructions.

**Quick overview:**

1. Create plugin directory: `packages/plugins/src/plugins/my-tool/`
2. Implement plugin interface with `detect()`, `apply()`, and `validate()` methods
3. Export from `packages/plugins/src/index.ts`
4. Register in config parser
5. Create plugin README
6. Add link in plugins package README

### Package Overview

- **[@genesis/core](./packages/core/README.md)**: Core engine, configuration, plugin system, utilities
- **[@genesis/plugins](./packages/plugins/README.md)**: Official plugin collection
- **[@genesis/cli](./apps/cli/README.md)**: Command-line interface

---

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or creating new plugins, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-new-feature`
3. **Make your changes**
4. **Build and test**: `bun run build && bun run test`
5. **Commit your changes**: `git commit -am 'Add new feature'`
6. **Push to the branch**: `git push origin feature/my-new-feature`
7. **Submit a Pull Request**

### Development Workflow

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Lint code
bun run lint

# Clean build artifacts
bun run clean
```

---

## License

MIT © Genesis Contributors

---

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/genesis/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/genesis/discussions)
- **Documentation**: [Full Documentation](https://genesis.dev)

---

**Made with ❤️ by developers, for developers**
