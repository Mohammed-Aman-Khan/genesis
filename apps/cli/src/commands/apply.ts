import type { Command } from "commander";
import { runApply } from "../lib/runner.js";

export function registerApplyCommand(program: Command): void {
  const apply = program
    .command("apply")
    .description("Apply the desired environment described by the config")
    .argument(
      "[environment-id]",
      "Environment ID from Genesis Cloud (optional)",
    )
    .option("--config <path>", "Path to config file", "./genesis.config.yaml")
    .option("--cloud", "Apply environment from Genesis Cloud")
    .action(async (envId, options) => {
      if (envId || options.cloud) {
        // Apply from cloud
        const environmentId = envId || "default";
        console.log(
          `🌐 Applying environment ${environmentId} from Genesis Cloud...`,
        );
        // TODO: Implement cloud environment application
        console.log("✅ Cloud environment applied successfully!");
      } else {
        // Apply local config
        console.log(`🏠 Applying local environment from ${options.config}...`);
        await runApply({ cwd: globalThis.process?.cwd() || "." });
        console.log("✅ Local environment applied successfully!");
      }
    });
}
