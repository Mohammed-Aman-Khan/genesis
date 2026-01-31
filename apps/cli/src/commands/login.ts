import { Command } from "commander";

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
      console.log("🔐 Logging into Genesis Cloud...");

      if (options.token) {
        console.log(`Using provided token for ${options.url}`);
        // TODO: Implement token validation and storage
      } else {
        console.log("Opening browser for authentication...");
        // TODO: Implement OAuth flow
      }

      console.log("✅ Successfully logged in!");
    });
}
