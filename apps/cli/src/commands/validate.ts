import type { Command } from "commander";
import { runValidate } from "../lib/runner.js";
export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate the Genesis configuration and environment")
    .action(async () => {
      await runValidate({ cwd: process.cwd() });
    });
}
