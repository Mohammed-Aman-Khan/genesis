import type { Command } from "commander";
import { runApply } from "../lib/runner.js";
export function registerApplyCommand(program: Command): void {
  program
    .command("apply")
    .description("Apply the desired environment described by the config")
    .action(async () => {
      await runApply({ cwd: process.cwd() });
    });
}
