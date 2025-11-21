import { loadConfig } from "@genesis/core";

export async function loadGenesisConfig(cwd: string) {
  return loadConfig(cwd);
}

