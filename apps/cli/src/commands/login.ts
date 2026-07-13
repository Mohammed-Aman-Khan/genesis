import { Command } from "commander";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

const TOKEN_FILE = path.join(os.homedir(), ".genesis", "auth.json");

function saveToken(token: string, url: string): void {
  const dir = path.dirname(TOKEN_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token, url, savedAt: new Date().toISOString() }));
}

function getStoredToken(): { token: string; url: string; savedAt?: string } | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
    }
  } catch { /* ignore */ }
  return null;
}

export function registerLoginCommand(program: Command): void {
  const login = program.command("login").description("Login to Genesis Cloud");

  login
    .option("-t, --token <token>", "Authentication token")
    .option(
      "-u, --url <url>",
      "Genesis Cloud URL",
      "https://cloud.genesis-docs.vercel.app",
    )
    .action(async (options) => {
      if (options.token) {
        saveToken(options.token, options.url);
        console.log(`✅ Authenticated with token for ${options.url}`);
        console.log(`   Token saved to ${TOKEN_FILE}`);
        return;
      }

      // Check for stored token
      const stored = getStoredToken();
      if (stored) {
        console.log(`✅ Already authenticated at ${stored.url}`);
        console.log(`   Saved: ${stored.savedAt}`);
        console.log("");
        console.log("To re-authenticate, run:");
        console.log("  genesis login --token <new-token>");
        return;
      }

      // For OAuth flow, print instructions since browser automation may not be available
      console.log("🔐 Opening Genesis Cloud for authentication...");
      console.log(`   Visit: ${options.url}/login`);
      console.log("");
      console.log("After logging in, run:");
      console.log("  genesis login --token <your-token>");
      console.log("");
      console.log("Or set the GENESIS_TOKEN environment variable:");
      console.log("  export GENESIS_TOKEN=<your-token>");
    });
}
