# What is Genesis?

Genesis is a **declarative, cross-platform developer environment provisioning engine** that automates the setup and configuration of development tools, languages, and SDKs.

## The Problem

Setting up a development environment typically involves:

1. **Manual installation** of tools (Node.js, Python, Docker, etc.)
2. **Platform-specific commands** (apt on Linux, brew on macOS, choco on Windows)
3. **Redundant operations** (running `apt-get update` multiple times)
4. **Inconsistent environments** across team members
5. **Outdated documentation** that doesn't match your system

This process is:
- ⏰ **Time-consuming** - Hours spent on setup instead of coding
- 🐛 **Error-prone** - Missing dependencies, wrong versions
- 📝 **Hard to document** - Long README files with platform-specific instructions
- 🔄 **Not reproducible** - "Works on my machine" syndrome

## The Solution

Genesis solves these problems with:

### 1. Declarative Configuration

Define your entire environment in a single file:

```typescript
import { defineConfig } from "@genesis/core";
import { node, python } from "@genesis/plugins";

export default defineConfig({
  tools: [
    node({ version: "20", use_nvm: true }),
  ],
  languages: [
    python({ version: "3.11" }),
  ],
});
```

### 2. Cross-Platform Support

Write once, run anywhere:
- ✅ **macOS** - Uses Homebrew, native installers
- ✅ **Linux** - Uses APT, YUM, DNF based on distro
- ✅ **Windows** - Provides installation guides (with future automation support)

### 3. Task Deduplication

Intelligent task registry eliminates redundant operations:

**Before Genesis:**
```bash
# Installing Node.js
sudo apt-get update  # Run 1
sudo apt-get install curl
# ... install NVM

# Installing Python
sudo apt-get update  # Run 2 (redundant!)
sudo apt-get install python3.11
```

**With Genesis:**
```bash
# Phase 1: Register tasks
# - Node plugin registers: apt-update, install-curl
# - Python plugin registers: apt-update, install-python3.11

# Phase 2: Execute tasks (deduplicated)
sudo apt-get update  # Runs ONCE!
sudo apt-get install curl
sudo apt-get install python3.11

# Phase 3: Plugin-specific installation
# - Install NVM using curl
# - Verify Python installation
```

### 4. Plugin Ecosystem

Extensible architecture with built-in plugins:
- **Tools**: Node.js (with NVM), and more coming soon
- **Languages**: Python, and more coming soon
- **Custom plugins**: Easy to create your own

## Key Features

### 🎯 Declarative

Define **what** you want, not **how** to install it. Genesis handles the platform-specific details.

### 🚀 Fast

Three-phase execution model with task deduplication means:
- Package manager updates run once
- Dependencies installed before they're needed
- No redundant operations

### 🔒 Type-Safe

TypeScript-first design with full IntelliSense support:
```typescript
// Full autocomplete and type checking
node({
  version: "20",  // ✅ Type-checked
  use_nvm: true,  // ✅ Autocomplete available
})
```

### 📊 Observable

Comprehensive logging at every step:
```
Phase 1: Registering tasks...
  ℹ node: Registered apt-update, install-curl
  ℹ python: Registered apt-update, install-python3.11

Phase 2: Executing system tasks...
  ✓ apt-get update (deduplicated - runs once!)
  ✓ apt-get install curl
  ✓ apt-get install python3.11

Phase 3: Installing plugins...
  ✓ node: NVM installed successfully
  ✓ python: Python 3.11 verified
```

### 🔄 Idempotent

Run Genesis multiple times safely:
- Detects existing installations
- Skips unnecessary operations
- Only installs what's missing

## How It Works

Genesis uses a **three-phase execution model**:

### Phase 1: Task Registration
Plugins register system-level prerequisites (package manager updates, system packages)

### Phase 2: Task Execution
Task registry executes all tasks with automatic deduplication

### Phase 3: Plugin Installation
Plugins perform their specific installation work

[Learn more about the architecture →](/guide/architecture)

## Use Cases

### Individual Developers
- Set up new machines quickly
- Maintain consistent environments across devices
- Document your setup as code

### Teams
- Onboard new developers in minutes
- Ensure everyone has the same tools and versions
- Reduce "works on my machine" issues

### CI/CD
- Reproducible build environments
- Fast setup with task deduplication
- Platform-agnostic configuration

## Comparison

| Feature | Genesis | Manual Setup | Docker Dev Containers |
|---------|---------|--------------|----------------------|
| Cross-platform | ✅ | ⚠️ Platform-specific | ✅ |
| Native performance | ✅ | ✅ | ⚠️ Overhead |
| Task deduplication | ✅ | ❌ | ❌ |
| Type-safe config | ✅ | ❌ | ⚠️ JSON |
| Learning curve | Low | High | Medium |
| Setup time | Minutes | Hours | Medium |

## What's Next?

Ready to get started?

- [Getting Started](/guide/getting-started) - Install Genesis and create your first config
- [Configuration](/guide/configuration) - Learn about configuration options
- [Plugins](/plugins/overview) - Explore available plugins

