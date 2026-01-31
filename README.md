# Genesis

> **Stop wasting hours setting up development environments. One command, done.**

Ever spent your first day at a new job following a 20-step setup guide that doesn't work? Ever had a teammate say "it works on my machine"? Yeah, we've been there too.

Genesis fixes that. Define your entire development environment once, and let Genesis handle the rest. No more manual setup, no more "works on my machine" bugs, no more outdated wiki pages.

---

## 🚀 This Changes Everything

### The Old Way (Painful)

```bash
# 20-step setup guide that's 6 months old
brew install node@20
brew install python@3.11
brew install git
brew install docker
# ...15 more steps
# Oh wait, this doesn't work on Ubuntu...
# Let me google the Ubuntu equivalents...
# Now I need to configure environment variables...
# What was that PATH trick again?
# 3 hours later... finally ready to code
```

### The Genesis Way (Magical)

```bash
# One command, any platform
genesis apply

# ✅ Node.js 20 installed
# ✅ Python 3.11 installed
# ✅ Git configured
# ✅ Docker running
# ✅ All repos cloned
# ✅ Environment variables set
# ✅ Dependencies installed
# Ready to code in 2 minutes
```

---

## 🎯 What Genesis Actually Does

Genesis is a **declarative environment provisioning engine**. Think of it as:

- **Infrastructure as Code**... but for your laptop
- **Docker Compose**... but for development tools, not services
- **Homebrew/Brewfile**... but cross-platform and way more powerful
- **Ansible**... but simple enough for anyone to use

### It Sets Up Everything:

🛠️ **Development Tools** - Node.js, Python, Go, Rust, Java, Git, Docker  
📦 **Package Managers** - npm, pip, cargo, maven, brew, apt  
🔌 **IDE Extensions** - VS Code extensions, settings, keybindings  
🌍 **Environment Variables** - API keys, paths, configuration  
📂 **Project Structure** - Clone repos, create directories, organize workspace  
🔧 **System Configuration** - Shell aliases, git config, Docker daemon

### And It Works Everywhere:

- **macOS** (Intel & Apple Silicon)
- **Linux** (Ubuntu, Fedora, Arch, etc.)
- **Windows** (WSL2 & Native)
- **Docker Containers** (fresh containers get fully set up)

---

## 🌟 Why You'll Love Genesis

### For New Team Members

```bash
# Day 1 at new job:
git clone company-project
cd company-project
genesis apply

# 5 minutes later:
# ✅ All tools installed
# ✅ All repos cloned
# ✅ Environment configured
# ✅ Ready to contribute
```

### For DevOps Teams

```bash
# Standardize environments across 50 developers
# One config file, perfect consistency
genesis validate  # Everyone passes the same checks
```

### For Open Source Contributors

```bash
# Contributing to a new project?
git clone cool-project
cd cool-project
genesis apply

# Instantly have the exact same setup as the maintainers
```

### For Freelancers/Consultants

```bash
# Jumping between client projects?
cd client-a
genesis apply    # Client A's stack

cd client-b
genesis apply    # Client B's stack

# Perfect isolation, zero conflicts
```

---

## 🎮 Getting Started (It's Stupidly Simple)

### Installation

```bash
# One-liner install (works everywhere)
curl -fsSL https://genesis-docs.vercel.app/install | sh

# Or download the binary directly
curl -fsSL https://releases.genesis-docs.vercel.app/latest/genesis-linux-x64 -o genesis
chmod +x genesis
sudo mv genesis /usr/local/bin/
```

### Your First Environment

```bash
# In any project directory
genesis init

# Answer a few questions (or skip with --defaults)
# What Node.js version? 20
# Need Python? Yes, 3.11
# Need Docker? Yes
# Git repos to clone? https://github.com/your-org/backend

# Genesis creates genesis.config.yaml
# Now apply it:
genesis apply

# That's it. You're done.
```

### Example Configuration

```yaml
# genesis.config.yaml - Your entire setup in one file
tools:
  - type: node
    version: "20"
    use_nvm: true

  - type: python
    version: "3.11"

  - type: git
    user_name: "Your Name"
    user_email: "you@company.com"

repositories:
  - url: https://github.com/your-org/backend
    path: ./backend
    branch: main

  - url: https://github.com/your-org/frontend
    path: ./frontend
    branch: develop

env:
  NODE_ENV: development
  API_URL: http://localhost:3000
  DATABASE_URL: postgresql://localhost:5432/myapp

scripts:
  - name: setup-database
    command: docker-compose up -d postgres
    when: before

  - name: install-deps
    command: npm install
    when: after
```

---

## 🚀 Advanced Magic

### Cloud Environments

```bash
# Login to Genesis Cloud
genesis login

# List team environments
genesis list --cloud

# Apply a specific environment
genesis apply production-env-123

# Switch between local and cloud
genesis apply              # Local config
genesis apply staging-456  # Cloud environment
```

### Environment Caching

```bash
# Genesis caches environments for instant switching
# First setup: 5 minutes
# Switch to cached environment: 10 seconds

genesis apply node-project     # Sets up Node.js project
cd ../python-project
genesis apply python-project   # Instant switch to Python setup
```

### Parallel Execution

```bash
# Genesis installs everything in parallel
# Node.js, Python, Git, Docker all install at once
# 3x faster than sequential installation
```

### Validation & Diffing

```bash
# See what would change before applying
genesis diff

# Validate your environment matches the config
genesis validate

# Run health checks
genesis doctor
```

---

## 🎯 Real-World Examples

### Web Development Team

```yaml
tools:
  - type: node
    version: "20"
    use_nvm: true

  - type: python
    version: "3.11"

  - type: docker

env:
  NODE_ENV: development
  REACT_APP_API_URL: http://localhost:8000

scripts:
  - name: start-services
    command: docker-compose up -d redis postgres
    when: before
```

### Mobile Development Team

```yaml
tools:
  - type: node
    version: "18"

  - type: java
    version: "17"

  - type: android-sdk
    version: "34"

env:
  ANDROID_HOME: /opt/android-sdk
  JAVA_HOME: /opt/java-17
```

### Data Science Team

```yaml
tools:
  - type: python
    version: "3.11"

  - type: docker

  - type: r
    version: "4.3"

env:
  PYTHONPATH: /workspace/src
  R_LIBS_USER: /workspace/r-packages

scripts:
  - name: setup-jupyter
    command: docker-compose up -d jupyter
    when: after
```

---

## 🔧 The CLI Commands You'll Actually Use

```bash
# The essentials
genesis init          # Create config file
genesis apply         # Apply configuration
genesis diff          # Preview changes
genesis validate      # Check environment

# Cloud features
genesis login         # Login to cloud
genesis list          # List environments
genesis apply env-123 # Apply cloud environment

# Utilities
genesis doctor        # Run diagnostics
genesis list-plugins  # Show available tools
```

---

## 🏗️ How It Works (The Cool Parts)

### Declarative Configuration

Your `genesis.config.yaml` is the **single source of truth**. No more scattered documentation, no more "remember to run this command" - everything is in one file that lives in git with your code.

### Plugin Architecture

Genesis is extensible. Need to set up a custom tool? Write a simple plugin. Most common tools are already supported:

- ✅ Node.js (NVM or standalone)
- ✅ Python (pyenv, conda, or system)
- ✅ Git (with configuration)
- ✅ Docker (with daemon setup)
- 🚧 Java, Go, Rust, .NET (coming soon)
- 🚧 VS Code extensions (coming soon)

### Cross-Platform Magic

The same config works on macOS, Linux, and Windows. Genesis handles:

- Package managers (brew, apt, yum, choco, winget)
- Path differences
- Shell configuration (bash, zsh, fish, powershell)
- Architecture differences (x64, ARM64)

### Idempotent Operations

Run `genesis apply` 100 times - it only makes changes when needed. Safe to run anytime, anywhere.

---

## 🎁 What Makes Genesis Special

### It's Not Another Docker

Genesis and Docker solve different problems:

- **Genesis**: Sets up your development tools (what you code WITH)
- **Docker**: Runs your services (what you code FOR)

Use both together for the perfect setup:

```bash
genesis apply    # Install Node.js, Git, IDE extensions
docker-compose up # Run PostgreSQL, Redis, Kafka
```

### It's Not Another Ansible

- **Ansible**: Powerful, complex, requires learning curve
- **Genesis**: Simple, declarative, anyone can use it

### It's Not Another Package Manager

- **Package managers**: Install individual packages
- **Genesis**: Orchestrates your entire environment

---

## 🚀 The Standalone Revolution

Here's the game-changer: Genesis is a **single standalone executable**.

```bash
# Download one binary, that's it
curl -fsSL https://releases.genesis-docs.vercel.app/latest/genesis-linux-x64 -o genesis
chmod +x genesis
./genesis apply

# Works on a completely bare system
# No Node.js required, no dependencies needed
# Genesis can even install Node.js if you need it
```

This means:

- **Fresh laptop?** Genesis works
- **Docker container?** Genesis works
- **CI/CD pipeline?** Genesis works
- **Air-gapped system?** Genesis works (with offline bundle)

---

## 🌈 Why Developers Are Switching to Genesis

### Before Genesis

- 😫 New developer onboarding takes 2-3 days
- 😫 "Works on my machine" bugs waste hours
- 😫 Environment drift causes subtle bugs
- 😫 Documentation is always outdated
- 😫 Platform-specific setup is a nightmare

### After Genesis

- 😊 New developers productive in 15 minutes
- 😊 Perfect consistency across the team
- 😊 Environments are version-controlled
- 😊 Config file IS the documentation
- 😊 Same config works everywhere

---

## 🎯 Who Is This For?

### Development Teams

- Standardize environments across 5, 50, or 500 developers
- Onboard new team members in minutes, not days
- Eliminate "works on my machine" bugs forever

### DevOps Engineers

- Define reproducible environments as code
- Manage multiple environments (dev, staging, prod)
- Integrate with CI/CD pipelines

### Open Source Maintainers

- Make it easy for contributors to get started
- Ensure consistent testing environments
- Reduce support burden

### Freelancers & Consultants

- Jump between client projects seamlessly
- Maintain separate environments for each client
- Impress clients with professional setup

---

## 🚀 Ready to Transform Your Workflow?

```bash
# Install Genesis (one command)
curl -fsSL https://genesis-docs.vercel.app/install | sh

# Try it in any project
cd your-project
genesis init
genesis apply

# Welcome to the future of development environments
```

---

## 🆚 Genesis vs Alternatives

**Why Genesis is the future of environment setup.**

| Feature            | Genesis   | Nix        | Docker     | Devbox     | Asdf       |
| ------------------ | --------- | ---------- | ---------- | ---------- | ---------- |
| **Setup Time**     | 5 minutes | 2-4 hours  | 10 minutes | 15 minutes | 20 minutes |
| **Learning Curve** | Low       | Very High  | Medium     | Medium     | Medium     |
| **Team Sync**      | ✅ Cloud  | ❌ Complex | ❌ Manual  | ❌ Manual  | ❌ Manual  |
| **Performance**    | 3x faster | Slow       | Medium     | Medium     | Slow       |
| **Dependencies**   | None      | Heavy      | Heavy      | Medium     | Light      |

### **Quick Comparison:**

- **Nix**: Powerful but painful 2-4 hour setup, steep learning curve
- **Docker**: Containers, not development - poor IDE integration
- **Devbox**: Good but incomplete - no parallel execution, limited cloud features
- **Asdf**: Version manager only - no environment setup
- **Genesis**: **Complete solution** - 5-minute setup, perfect team sync, 3x faster

[**📖 See detailed comparison**](./apps/docs/guide/comparison.md) → Complete feature breakdown, migration guides, and real-world examples

---

## 📚 Learn More

- [**CLI Documentation**](./apps/cli/README.md) - All commands and options
- [**Plugin Development**](./docs/PLUGIN_DEVELOPMENT.md) - Build your own plugins
- [**Core Architecture**](./packages/core/README.md) - How Genesis works under the hood
- [**Examples**](./examples/) - Real-world configuration examples
- [**Genesis vs Alternatives**(./apps/docs/guide/comparison.md) - See how Genesis compares to Nix, Docker, Devbox, and more

---

## 🤝 Contributing

We're building this together! Whether you're:

- 🐛 Fixing bugs
- ✨ Adding features
- 🔌 Building plugins
- 📖 Improving docs

Your contribution matters. See the [Contributing Guide](./CONTRIBUTING.md) to get started.

---

## 📄 License

MIT © Genesis Contributors

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/genesis/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/genesis/discussions)
- **Documentation**: [Full Docs](https://genesis-docs.vercel.app)

---

**Made with ❤️ by developers who were tired of wasting time on setup**

---

_P.S. Yes, it really is this good. Try it and see for yourself._ 🚀
