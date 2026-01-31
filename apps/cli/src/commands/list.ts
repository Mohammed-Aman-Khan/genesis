import { Command } from "commander";

export function registerListCommand(program: Command): void {
  const list = program
    .command("list")
    .description("List available environments");

  list
    .option("--cloud", "List environments from Genesis Cloud")
    .option("--local", "List local environments", true)
    .option("--format <format>", "Output format (table|json)", "table")
    .action(async (options) => {
      console.log("📋 Listing environments...");
      
      if (options.cloud) {
        console.log("Fetching environments from Genesis Cloud...");
        // TODO: Implement cloud environment listing
        console.log("🌐 Cloud Environments:");
        console.log("  - production-prod-123 (Production)");
        console.log("  - staging-stage-456 (Staging)");
        console.log("  - dev-dev-789 (Development)");
      }
      
      if (options.local) {
        console.log("🏠 Local Environments:");
        console.log("  - current (./genesis.config.yaml)");
        console.log("  - backup (./backup.config.yaml)");
      }
      
      console.log("✅ Environment listing complete!");
    });
}
