import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Genesis",
  description:
    "Declarative, cross-platform developer environment provisioning engine",

  // Ensure clean URLs work on Vercel
  cleanUrls: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",

    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/introduction" },
      { text: "Plugins", link: "/plugins/overview" },
      { text: "API Reference", link: "/api/core" },
      {
        text: "v0.1.0",
        items: [
          {
            text: "Changelog",
            link: "https://github.com/Mohammed-Aman-Khan/genesis/releases",
          },
          { text: "Contributing", link: "/guide/contributing" },
        ],
      },
    ],

    sidebar: {
      "/guide/": {
        base: "/guide/",
        items: [
          {
            text: "Introduction",
            collapsed: false,
            items: [
              { text: "What is Genesis?", link: "introduction" },
              { text: "Getting Started", link: "getting-started" },
              { text: "Quick Start", link: "quick-start" },
            ],
          },
          {
            text: "Core Concepts",
            collapsed: false,
            items: [
              { text: "Configuration", link: "configuration" },
              { text: "Plugins", link: "plugins" },
              { text: "Task Registry", link: "task-registry" },
              { text: "Platform Support", link: "platform-support" },
            ],
          },
          {
            text: "Advanced",
            collapsed: false,
            items: [
              { text: "Task Deduplication", link: "task-deduplication" },
              { text: "Plugin Development", link: "plugin-development" },
              { text: "Architecture", link: "architecture" },
              { text: "Troubleshooting", link: "troubleshooting" },
            ],
          },
          {
            text: "Contributing",
            collapsed: false,
            items: [
              { text: "Contributing Guide", link: "contributing" },
              { text: "Development Setup", link: "development-setup" },
            ],
          },
        ],
      },

      "/plugins/": {
        base: "/plugins/",
        items: [
          {
            text: "Plugins",
            collapsed: false,
            items: [
              { text: "Overview", link: "overview" },
              { text: "Plugin Lifecycle", link: "lifecycle" },
            ],
          },
          {
            text: "Tools",
            collapsed: false,
            items: [{ text: "Node.js", link: "node" }],
          },
          {
            text: "Languages",
            collapsed: false,
            items: [{ text: "Python", link: "python" }],
          },
          {
            text: "Development",
            collapsed: false,
            items: [
              { text: "Creating a Plugin", link: "creating-plugin" },
              { text: "Best Practices", link: "best-practices" },
            ],
          },
        ],
      },

      "/api/": {
        base: "/api/",
        items: [
          {
            text: "API Reference",
            collapsed: false,
            items: [
              { text: "Core API", link: "core" },
              { text: "Plugin API", link: "plugin" },
              { text: "Task Registry API", link: "task-registry" },
              { text: "Utilities", link: "utilities" },
            ],
          },
        ],
      },
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Mohammed-Aman-Khan/genesis" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Mohammed Aman Khan",
    },

    editLink: {
      pattern:
        "https://github.com/Mohammed-Aman-Khan/genesis/edit/main/apps/docs/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
    },

    outline: {
      level: [2, 3],
      label: "On this page",
    },
  },

  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
});
