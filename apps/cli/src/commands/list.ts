import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

interface EnvironmentEntry {
  id: string;
  name: string;
  description: string;
  source: "local" | "cloud";
  createdAt?: string;
}

function getLocalEnvs(): EnvironmentEntry[] {
  const entries: EnvironmentEntry[] = [];
  const cacheDir = path.join(os.homedir(), ".genesis", "cache");

  try {
    if (fs.existsSync(cacheDir)) {
      const files = fs.readdirSync(cacheDir).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(cacheDir, file), "utf8"));
          entries.push({
            id: data.id || file.replace(".json", ""),
            name: data.name || file.replace(".json", ""),
            description: data.description || "",
            source: "local",
            createdAt: data.createdAt,
          });
        } catch { /* skip corrupted files */ }
      }
    }
  } catch { /* cache dir might not exist */ }

  // Check for local config files
  const cwd = process.cwd();
  for (const configName of ["genesis.config.yaml", "genesis.config.ts"]) {
    const configPath = path.join(cwd, configName);
    if (fs.existsSync(configPath)) {
      entries.unshift({
        id: "current",
        name: "Current Project",
        description: `Loaded from ${configName}`,
        source: "local",
      });
      break;
    }
  }

  return entries;
}

export function registerListCommand(program: Command): void {
  const list = program
    .command("list")
    .description("List available environments");

  list
    .option("--cloud", "List environments from Genesis Cloud")
    .option("--local", "List local environments", true)
    .option("--format <format>", "Output format (table|json)", "table")
    .action(async (options) => {
      const envs: EnvironmentEntry[] = [];

      if (options.local) {
        envs.push(...getLocalEnvs());
      }

      if (options.cloud) {
        // Try stored token
        const tokenFile = path.join(os.homedir(), ".genesis", "auth.json");
        let hasCloudAccess = false;
        try {
          if (fs.existsSync(tokenFile)) {
            hasCloudAccess = true;
          }
        } catch { /* ignore */ }

        if (hasCloudAccess) {
          console.log("🌐 Cloud Environments:");
          console.log("  (Cloud API not yet available -- showing cached)");
          // In future: fetch from cloud API using stored token
        } else {
          console.log("🌐 Cloud Environments:");
          console.log("  Run `genesis login` to connect to Genesis Cloud");
        }
      }

      if (options.format === "json") {
        console.log(JSON.stringify(envs, null, 2));
        return;
      }

      if (envs.length === 0) {
        console.log("No environments found.");
        console.log("  Run `genesis init` to create a new configuration");
        console.log("  Run `genesis apply` to cache your current environment");
        return;
      }

      console.log("🏠 Local Environments:");
      for (const env of envs) {
        const timeStr = env.createdAt ? ` (${new Date(env.createdAt).toLocaleDateString()})` : "";
        console.log(`  - ${env.id.padEnd(20)} ${env.name}${timeStr}`);
      }
    });
}
