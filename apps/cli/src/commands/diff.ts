import type { Command } from "commander";
import { runDiff } from "../lib/runner.js";
export function registerDiffCommand(program: Command): void {
  program
    .command("diff")
    .description(
      "Show differences between desired and actual environment state"
    )
    .action(async () => {
      await runDiff({ cwd: process.cwd() });
    });
}
