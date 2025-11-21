import type { Command } from "commander";
import { promptCreateConfig } from "../lib/prompts.js";
export function registerCreateCommand(program: Command): void {
  program
    .command("create")
    .description("Create a new Genesis environment repository")
    .action(async () => {
      await promptCreateConfig();
    });
}
