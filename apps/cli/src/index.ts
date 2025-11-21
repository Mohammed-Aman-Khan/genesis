import { Command } from "commander";
import { registerCreateCommand } from "./commands/create.js";
import { registerApplyCommand } from "./commands/apply.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerDiffCommand } from "./commands/diff.js";
import { registerValidateCommand } from "./commands/validate.js";
import { registerInitCommand } from "./commands/init.js";
import { registerListPluginsCommand } from "./commands/list-plugins.js";

export function createCli(): Command {
  const program = new Command();
  program.name("genesis");
  program.description(
    "Rebuild any developer environment. Deterministic. Portable. Declarative."
  );
  registerCreateCommand(program);
  registerApplyCommand(program);
  registerDoctorCommand(program);
  registerDiffCommand(program);
  registerValidateCommand(program);
  registerInitCommand(program);
  registerListPluginsCommand(program);
  return program;
}

export async function run(argv: string[] = process.argv): Promise<void> {
  const program = createCli();
  await program.parseAsync(argv);
}

run().catch((error) => {
  const value = error instanceof Error ? error.message : String(error);
  console.error(value);
  process.exit(1);
});
