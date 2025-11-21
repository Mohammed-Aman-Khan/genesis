import type { Command } from "commander";
import { runDoctor } from "../lib/runner.js";
export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Run diagnostics against the current environment")
    .action(async () => {
      await runDoctor({ cwd: process.cwd() });
    });
}
