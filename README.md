# Genesis Monorepo

Genesis is a declarative, cross-platform developer environment provisioning engine.

You describe your entire developer environment once in a single config file and Genesis inspects your current machine, compares it with the desired state, and reports what is present, missing, or misconfigured.

This repository is a Bun + Turborepo monorepo that contains:

- `apps/cli` – the `@genesis/cli` command-line interface (the `genesis` binary)
- `packages/core` – the `@genesis/core` TypeScript library (config model, loader, plugin runtime, utilities)
- `packages/plugins` – the `@genesis/plugins` official plugin collection (currently a Node.js runtime plugin)

The goal is to make onboarding and rebuilding developer environments deterministic, portable, and reviewable.

---

## Why Genesis?

Modern teams depend on increasingly complex local environments:

- Multiple languages and runtimes (Node, Python, Go, Java, etc.)
- SDKs and CLIs for cloud providers and internal platforms
- A set of repositories that must be cloned in a specific layout
- Project scripts to bootstrap, run, and test services
- Environment variables and PATH tweaks

Typical onboarding instructions are a mix of wikis, shell snippets, and tribal knowledge. This leads to:

- Slow, error-prone setup for new engineers
- Inconsistent environments across macOS, Linux, and Windows
- Hard-to-review changes to the environment definition

Genesis addresses this by providing:

- A **single source of truth** (`genesis.config.ts` or `genesis.config.yaml`)
- A **plugin-based engine** that can detect, apply, and validate environment state
- A **CLI** that exposes high-level workflows for day‑to‑day use

---

## Monorepo Layout

```text
apps/
  cli/           # @genesis/cli – end-user CLI
packages/
  core/          # @genesis/core – core library and runtime
  plugins/       # @genesis/plugins – official plugins (e.g. Node)
```

Each workspace is a standalone TypeScript package built with `tsup` and orchestrated by Turborepo.

---

## Using the Monorepo (Maintainers)

This section is for working on Genesis itself.

### Prerequisites

- Bun (used as the package manager and script runner)
- Node.js 18+ (for tooling like `tsup` and `turbo`)

### Install dependencies

From the repo root:

```bash
bun install
```

### Build everything

```bash
bun run build
```

This runs `turbo run build` and builds:

- `@genesis/core`
- `@genesis/plugins`
- `@genesis/cli`

### Build individual workspaces

Core library:

```bash
cd packages/core
bun run build
```

Plugins:

```bash
cd packages/plugins
bun run build
```

CLI:

```bash
cd apps/cli
bun run build
```

---

## Using Genesis in a Project

This section is for consumers of Genesis.

### 1. Install the CLI

In your project repository:

```bash
bun add -d @genesis/cli
```

Optionally add a convenience script in `package.json`:

```json
{
  "scripts": {
    "genesis": "genesis apply"
  }
}
```

You can then run:

```bash
bun run genesis
```

You can also use `bunx` if you install `@genesis/cli` globally:

```bash
bun add -g @genesis/cli
bunx genesis --help
```

### 2. Initialize Genesis

From within your project directory:

```bash
genesis init
```

This command:

1. Asks which config format you want (`ts` or `yaml`).
2. Ensures `genesis.config.ts` or `genesis.config.yaml` exists.
3. Creates a minimal `README.md` if missing.
4. Creates a `package.json` with a `genesis` script if it does not exist.

### 3. Describe your environment

The central file is your Genesis config.

#### TypeScript example (`genesis.config.ts`)

```ts
import { defineConfig } from "@genesis/core";
import { node } from "@genesis/plugins/node";

export default defineConfig({
  tools: [
    node({ version: "20" }),
  ],
  sdks: [],
  languages: [],
  repositories: [],
  scripts: [],
  env: {
    NODE_ENV: "development",
  },
});
```

#### YAML example (`genesis.config.yaml`)

```yaml
tools:
  - type: node
    version: "20"
sdks: []
languages: []
repositories: []
scripts: []
env:
  NODE_ENV: development
```

### 4. Apply the environment

```bash
genesis apply
```

This will:

1. Load your config via `@genesis/core`.
2. Collect plugin instances from `tools`, `sdks`, and `languages`.
3. Load each plugin module and build a dependency graph.
4. Run each plugins `apply` method.
5. Print a summary table of results.

### 5. Inspect and validate

Diagnostics:

```bash
genesis doctor
```

Diff between desired and actual state:

```bash
genesis diff
```

Validate configuration and environment:

```bash
genesis validate
```

See `apps/cli/README.md` for command details.

---

## Packages Overview

### `@genesis/core` (`packages/core`)

Core library that defines the configuration model, plugin types, loader, dependency graph, and execution pipelines. It exports:

- `defineConfig`, `loadConfig`, `validateConfig`
- Types such as `GenesisConfig`, `GenesisPluginInstance`, `GenesisPlugin`
- Execution helpers: `collectPluginInstances`, `loadPlugins`, `buildPluginGraph`, `runDetect`, `runApply`, `runValidate`, `runDiff`
- Utilities: `Logger`, `runCommand`, `getPlatform`, `applyEnvPatch`, `editPath`

See `packages/core/README.md` for full details.

### `@genesis/plugins` (`packages/plugins`)

Official plugin collection. Currently includes a Node.js plugin exposed as `@genesis/plugins/node`.

See `packages/plugins/README.md` for plugin behavior and configuration examples.

### `@genesis/cli` (`apps/cli`)

End-user CLI that wires `@genesis/core` to a friendly command-line interface.

See `apps/cli/README.md` for usage, commands, and programmatic examples.

---

## Evolution

Genesis is designed to evolve. New plugins, commands, and configuration options can be added without changing existing projects.

The READMEs in this monorepo may change over time to reflect new capabilities. Always refer to the latest version in the repository for the most accurate information.
