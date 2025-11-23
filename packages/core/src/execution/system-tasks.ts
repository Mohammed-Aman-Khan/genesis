/**
 * System-level task definitions for common operations
 * 
 * This module provides pre-defined tasks for common system operations
 * that should be deduplicated across plugins.
 */

import { type Task, type TaskId } from "./task-registry.js";
import { runCommand } from "../os/shell.js";
import { getPlatform } from "../os/platform.js";

/**
 * Create a task ID for package manager operations
 */
export function createPackageManagerTaskId(
  operation: "update" | "install",
  packageName?: string
): TaskId {
  const platform = getPlatform();
  const pkgManager = getPackageManager(platform);
  
  if (operation === "update") {
    return `${platform}:package-manager:${pkgManager}-update`;
  }
  
  return `${platform}:package-manager:${pkgManager}-install:${packageName}`;
}

/**
 * Get the default package manager for a platform
 */
function getPackageManager(platform: string): string {
  switch (platform) {
    case "macos":
      return "brew";
    case "linux":
      return "apt"; // Default to apt, could be enhanced to detect yum, dnf, etc.
    case "windows":
      return "choco"; // Chocolatey
    default:
      return "unknown";
  }
}

/**
 * Create a task for updating package manager cache
 */
export function createPackageManagerUpdateTask(cwd: string, env: NodeJS.ProcessEnv): Task {
  const platform = getPlatform();
  const taskId = createPackageManagerTaskId("update");

  let command: string;
  let args: string[];
  let description: string;
  let requiresSudo = false;

  switch (platform) {
    case "macos":
      command = "brew";
      args = ["update"];
      description = "Update Homebrew package index";
      break;

    case "linux":
      command = "sudo";
      args = ["apt-get", "update", "-y"];
      description = "Update APT package index";
      requiresSudo = true;
      break;

    case "windows":
      command = "choco";
      args = ["upgrade", "all", "-y"];
      description = "Update Chocolatey packages";
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return {
    id: taskId,
    description,
    priority: 100, // High priority - should run before installs
    executor: async () => {
      try {
        const result = await runCommand(command, args, { cwd, env });
        
        if (result.code === 0) {
          return {
            ok: true,
            details: `Package manager updated successfully`,
          };
        }

        return {
          ok: false,
          error: result.stderr || "Package manager update failed",
          details: result.stderr,
        };
      } catch (error) {
        return {
          ok: false,
          error: (error as Error).message,
        };
      }
    },
  };
}

/**
 * Create a task for installing a system package
 */
export function createPackageInstallTask(
  packageName: string,
  cwd: string,
  env: NodeJS.ProcessEnv
): Task {
  const platform = getPlatform();
  const taskId = createPackageManagerTaskId("install", packageName);
  const updateTaskId = createPackageManagerTaskId("update");

  let command: string;
  let args: string[];
  let description: string;

  switch (platform) {
    case "macos":
      command = "brew";
      args = ["install", packageName];
      description = `Install ${packageName} via Homebrew`;
      break;

    case "linux":
      command = "sudo";
      args = ["apt-get", "install", "-y", packageName];
      description = `Install ${packageName} via APT`;
      break;

    case "windows":
      command = "choco";
      args = ["install", packageName, "-y"];
      description = `Install ${packageName} via Chocolatey`;
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return {
    id: taskId,
    description,
    priority: 50, // Medium priority
    dependsOn: [updateTaskId], // Ensure package manager is updated first
    executor: async () => {
      try {
        const result = await runCommand(command, args, { cwd, env });
        
        if (result.code === 0) {
          return {
            ok: true,
            details: `${packageName} installed successfully`,
          };
        }

        return {
          ok: false,
          error: result.stderr || `Failed to install ${packageName}`,
          details: result.stderr,
        };
      } catch (error) {
        return {
          ok: false,
          error: (error as Error).message,
        };
      }
    },
  };
}

/**
 * Create a task for checking if a command exists
 */
export function createCommandCheckTask(
  commandName: string,
  cwd: string,
  env: NodeJS.ProcessEnv
): Task {
  const platform = getPlatform();
  const taskId = `${platform}:command-check:${commandName}`;

  return {
    id: taskId,
    description: `Check if ${commandName} is available`,
    priority: 200, // Very high priority - checks should run first
    executor: async () => {
      try {
        const checkCommand = platform === "windows" ? "where" : "which";
        const result = await runCommand(checkCommand, [commandName], { cwd, env });
        
        if (result.code === 0) {
          return {
            ok: true,
            details: `${commandName} is available`,
          };
        }

        return {
          ok: false,
          details: `${commandName} is not available`,
        };
      } catch (error) {
        return {
          ok: false,
          error: (error as Error).message,
        };
      }
    },
  };
}

/**
 * Create a custom task
 */
export function createCustomTask(
  id: string,
  description: string,
  executor: () => Promise<{ ok: boolean; details?: string; error?: string }>,
  options?: {
    priority?: number;
    dependsOn?: TaskId[];
  }
): Task {
  const platform = getPlatform();
  const taskId = `${platform}:custom:${id}`;

  return {
    id: taskId,
    description,
    priority: options?.priority ?? 0,
    dependsOn: options?.dependsOn,
    executor,
  };
}

/**
 * Helper to ensure package manager is updated
 * Returns the task ID for the update operation
 */
export function ensurePackageManagerUpdate(): TaskId {
  return createPackageManagerTaskId("update");
}

/**
 * Helper to ensure a package is installed
 * Returns the task ID for the install operation
 */
export function ensurePackageInstalled(packageName: string): TaskId {
  return createPackageManagerTaskId("install", packageName);
}

