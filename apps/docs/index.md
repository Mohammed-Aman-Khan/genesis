---
layout: home

hero:
  name: "Genesis"
  text: "Declarative Environment Provisioning"
  tagline: Cross-platform developer environment setup made simple, fast, and reproducible
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Mohammed-Aman-Khan/genesis

features:
  - icon: 🚀
    title: Declarative Configuration
    details: Define your entire development environment in a single YAML or TypeScript file. No more manual setup scripts.

  - icon: 🔄
    title: Task Deduplication
    details: Intelligent task registry eliminates redundant operations. Package manager updates run once, not per plugin.

  - icon: 🌍
    title: Cross-Platform
    details: Works seamlessly on macOS, Linux, and Windows. Write once, provision anywhere.

  - icon: 🧩
    title: Plugin Ecosystem
    details: Extensible plugin system for tools, languages, and SDKs. Create custom plugins with ease.

  - icon: ⚡
    title: Optimized Performance
    details: Three-phase execution model ensures dependencies are available when needed, with zero redundancy.

  - icon: 🛠️
    title: Developer Friendly
    details: TypeScript-first with full type safety, comprehensive logging, and detailed error messages.
---

## Quick Example

::: code-group

```typescript [genesis.config.ts]
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

```yaml [genesis.yaml]
tools:
  - type: node
    version: "20"
    use_nvm: true

languages:
  - type: python
    version: "3.11"
```

:::

## Why Genesis?

Setting up development environments is tedious and error-prone. Genesis solves this by:

- **Eliminating manual setup** - No more copy-pasting commands from README files
- **Ensuring consistency** - Same environment across all team members and CI/CD
- **Saving time** - Optimized execution with task deduplication
- **Supporting all platforms** - macOS, Linux, and Windows from a single config

## What's Next?

<div class="vp-doc">

- [Get Started](/guide/getting-started) - Install Genesis and create your first config
- [Learn the Concepts](/guide/configuration) - Understand how Genesis works
- [Explore Plugins](/plugins/overview) - Discover available plugins
- [Create a Plugin](/guide/plugin-development) - Build your own plugin

</div>

