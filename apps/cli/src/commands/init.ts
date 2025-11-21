import type { Command } from "commander";
import { promptInitConfig } from "../lib/prompts.js";
export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize Genesis in an existing environment repository")
    .action(async () => {
      await promptInitConfig();
    });
}
