import type { Command } from "commander";

const BUILTIN_PLUGINS = [
  { id: "node", module: "@ossl/genesis-plugins/node", description: "Node.js JavaScript runtime" },
  { id: "python", module: "@ossl/genesis-plugins/python", description: "Python programming language" },
  { id: "go", module: "@ossl/genesis-plugins/go", description: "Go programming language" },
  { id: "docker", module: "@ossl/genesis-plugins/docker", description: "Docker container runtime" },
  { id: "java", module: "@ossl/genesis-plugins/java", description: "Java development kit" },
  { id: "homebrew", module: "@ossl/genesis-plugins/homebrew", description: "Homebrew package manager (macOS/Linux)" },
  { id: "git", module: "@ossl/genesis-plugins/git", description: "Git version control system" },
];

export function registerListPluginsCommand(program: Command): void {
  program
    .command("list-plugins")
    .description("List available Genesis plugins")
    .option("--json", "Output as JSON")
    .action(async (options) => {
      const plugins = BUILTIN_PLUGINS;

      if (options.json) {
        console.log(JSON.stringify(plugins, null, 2));
        return;
      }

      console.log(`Available plugins (${plugins.length}):`);
      console.log("");
      const moduleWidth = Math.max(...plugins.map((p) => p.module.length));
      for (const plugin of plugins) {
        console.log(`  ${plugin.module.padEnd(moduleWidth + 2)} ${plugin.description}`);
      }
      console.log("");
      console.log("Usage in genesis.config.yaml:");
      console.log("  tools:");
      console.log("    - type: node");
      console.log('      version: "20"');
    });
}
