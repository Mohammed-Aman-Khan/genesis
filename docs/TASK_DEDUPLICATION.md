# Task Deduplication & Batching Architecture

## Overview

Genesis implements a sophisticated task deduplication and batching system to optimize environment setup by eliminating redundant system-level operations.

## The Problem

When installing multiple plugins (e.g., Node.js and Python), each plugin might need to perform the same system-level operations:

```bash
# Without deduplication:
# Node.js plugin runs:
sudo apt-get update    # ← Redundant!
sudo apt-get install -y curl

# Python plugin runs:
sudo apt-get update    # ← Redundant! (already ran above)
sudo apt-get install -y python3
```

This leads to:
- ⏰ **Wasted time**: Running `apt update` multiple times
- 🔄 **Unnecessary network calls**: Downloading package indices repeatedly
- 💾 **Resource waste**: CPU and I/O overhead

## The Solution

Genesis uses a **Task Registry** system that:

1. **Deduplicates** system-level operations across all plugins
2. **Batches** tasks for optimal execution order
3. **Manages dependencies** between tasks
4. **Executes once** per Genesis run

```bash
# With deduplication:
# Both plugins register their tasks
# Genesis executes:
sudo apt-get update           # ← Runs ONCE
sudo apt-get install -y curl  # ← For Node.js
sudo apt-get install -y python3  # ← For Python
```

## Architecture

### Task Registry

The `TaskRegistry` is a centralized registry that:
- Stores unique tasks by ID
- Prevents duplicate task registration
- Manages task execution order
- Handles task dependencies

```typescript
import { TaskRegistry } from "@genesis/core";

const taskRegistry = new TaskRegistry(logger);

// Register tasks (duplicates are automatically ignored)
taskRegistry.register(updateTask);
taskRegistry.register(installTask);

// Execute all tasks in dependency order
await taskRegistry.executeAll();
```

### Task Definition

Each task has:
- **ID**: Unique identifier (e.g., `"linux:package-manager:apt-update"`)
- **Description**: Human-readable description
- **Executor**: Async function that performs the task
- **Priority**: Execution order (higher = earlier)
- **Dependencies**: Other tasks that must complete first

```typescript
interface Task {
  id: TaskId;
  description: string;
  executor: () => Promise<TaskResult>;
  priority?: number;
  dependsOn?: TaskId[];
}
```

### Task ID Format

Task IDs follow a consistent format:
```
platform:category:operation[:parameter]
```

Examples:
- `macos:package-manager:brew-update`
- `linux:package-manager:apt-update`
- `linux:package-manager:apt-install:curl`
- `windows:package-manager:choco-update`

## Execution Flow

Genesis uses a **three-phase execution model** to ensure system-level tasks are completed before plugins need them:

### Phase 1: Task Registration

Plugins register their system-level prerequisites using the `registerTasks()` method:

```typescript
async registerTasks(runtime) {
  const { taskRegistry } = runtime.context;

  // Register package manager update (will be deduplicated)
  const updateTask = createPackageManagerUpdateTask(
    runtime.context.cwd,
    runtime.context.env
  );
  taskRegistry.register(updateTask);

  // Register package installation
  const installTask = createPackageInstallTask(
    "curl",
    runtime.context.cwd,
    runtime.context.env
  );
  taskRegistry.register(installTask);
}
```

### Phase 2: Task Execution

After all plugins have registered their tasks, Genesis executes them:

1. **Topological sort**: Order tasks by dependencies and priority
2. **Execute in order**: Run each task once (deduplicated)
3. **Handle failures**: Skip dependent tasks if prerequisites fail
4. **Report results**: Log success/failure for each task

### Phase 3: Plugin Installation

Plugins execute their `apply()` methods to perform actual installation work:

```typescript
async apply(runtime) {
  const { logger } = runtime.context;

  // System dependencies (curl, etc.) are now available
  // Perform plugin-specific installation
  logger.info("Installing NVM...");
  await runCommand("bash", ["-c", "curl -o- https://... | bash"]);

  return { ok: true, didChange: true };
}
```

This ensures that system-level dependencies are available when plugins need them!

## System Task Helpers

Genesis provides pre-built helpers for common operations:

### Package Manager Update

```typescript
import { createPackageManagerUpdateTask } from "@genesis/core";

const task = createPackageManagerUpdateTask(cwd, env);
// Creates:
// - macOS: "brew update"
// - Linux: "sudo apt-get update -y"
// - Windows: "choco upgrade all -y"
```

### Package Installation

```typescript
import { createPackageInstallTask } from "@genesis/core";

const task = createPackageInstallTask("curl", cwd, env);
// Creates:
// - macOS: "brew install curl"
// - Linux: "sudo apt-get install -y curl"
// - Windows: "choco install curl -y"
```

### Custom Tasks

```typescript
import { createCustomTask } from "@genesis/core";

const task = createCustomTask(
  "my-custom-task",
  "Description of what this does",
  async () => {
    // Your custom logic here
    return { ok: true, details: "Success!" };
  },
  {
    priority: 50,
    dependsOn: ["linux:package-manager:apt-update"],
  }
);
```

## Plugin Integration

### Using Task Registry in Plugins

```typescript
import {
  type GenesisPlugin,
  type PluginRuntime,
  createPackageManagerUpdateTask,
  createPackageInstallTask,
} from "@genesis/core";

export function createPlugin(instance): GenesisPlugin {
  return {
    id: instance.id,
    category: instance.category,

    // Phase 1: Register system-level tasks
    async registerTasks(runtime: PluginRuntime) {
      const { taskRegistry, logger } = runtime.context;

      logger.debug("Registering system tasks");

      // Register package manager update (deduplicated)
      taskRegistry.register(
        createPackageManagerUpdateTask(
          runtime.context.cwd,
          runtime.context.env
        )
      );

      // Register system package installation (deduplicated)
      taskRegistry.register(
        createPackageInstallTask(
          "my-package",
          runtime.context.cwd,
          runtime.context.env
        )
      );
    },

    // Phase 3: Perform plugin-specific installation
    async apply(runtime: PluginRuntime) {
      const { logger } = runtime.context;

      // System packages are now installed
      logger.info("Performing plugin installation...");

      // Your plugin-specific logic here

      return {
        ok: true,
        didChange: true,
        details: "Installation completed",
      };
    },
  };
}
```

## Benefits

### Performance

- ✅ **Faster execution**: No redundant operations
- ✅ **Reduced network calls**: Package indices downloaded once
- ✅ **Optimized I/O**: Minimal disk operations

### Reliability

- ✅ **Dependency management**: Tasks execute in correct order
- ✅ **Error handling**: Failed tasks don't block unrelated tasks
- ✅ **Idempotent**: Safe to run multiple times

### Developer Experience

- ✅ **Simple API**: Easy to register tasks
- ✅ **Automatic deduplication**: No manual coordination needed
- ✅ **Clear logging**: See exactly what's happening

## Example: Multiple Plugins

### Configuration

```yaml
tools:
  - type: node
    version: "20"

languages:
  - type: python
    version: "3.11"
```

### Execution Log

```
🚀 Genesis Apply

📦 Loading configuration...
✓ Configuration loaded: genesis.config.yaml

Phase 1: Registering system-level tasks...
  ℹ node: Registering system tasks for NVM installation prerequisites
  ℹ node: System tasks registered: package manager update, curl installation
  ℹ python: Registering system tasks for Python installation
  ℹ python: System tasks registered: package manager update, python3.11 installation

Phase 2: Executing system tasks...
  ℹ Executing 3 system task(s)...
  ✓ Update APT package index (deduplicated - runs ONCE!)
  ✓ Install curl via APT
  ✓ Install python3.11 via APT
  ℹ System tasks completed: 3 succeeded, 0 failed

Phase 3: Executing plugin apply methods...
  ℹ node: Installing Node.js via NVM...
  ✓ node: NVM installed successfully
  ℹ python: Python 3.11 should now be installed via system package manager
  ✓ python: Installation completed

✅ Apply complete!
```

Notice:
- `apt-get update` runs **once** (not twice) - deduplicated!
- System tasks execute before plugins need them
- Tasks execute in dependency order
- Clear three-phase execution model

## Advanced Usage

### Task Priorities

Higher priority tasks run first:

```typescript
const highPriorityTask = {
  id: "my-task",
  description: "Important task",
  priority: 200,  // Very high
  executor: async () => ({ ok: true }),
};

const normalTask = {
  id: "other-task",
  description: "Normal task",
  priority: 50,   // Medium
  executor: async () => ({ ok: true }),
};
```

Default priorities:
- **200**: Command checks
- **100**: Package manager updates
- **50**: Package installations
- **0**: Custom tasks (default)

### Task Dependencies

Tasks can depend on other tasks:

```typescript
const installTask = {
  id: "linux:package-manager:apt-install:curl",
  description: "Install curl",
  dependsOn: ["linux:package-manager:apt-update"],
  executor: async () => ({ ok: true }),
};
```

## Best Practices

1. **Use `registerTasks()` for system-level operations**
   - Package manager operations (`apt update`, `brew update`)
   - System package installations (`apt install curl`)
   - Global tool installations that require system packages
   - Operations that might be needed by multiple plugins

2. **Use `apply()` for plugin-specific logic**
   - User-space installations (NVM, pyenv, rbenv)
   - Configuration file modifications
   - Environment variable setup
   - Plugin-specific setup that depends on system packages

3. **Separate concerns properly**
   - `registerTasks()`: What system packages do I need?
   - `apply()`: How do I install my tool using those packages?

4. **Set appropriate priorities**
   - Checks: 200
   - Updates: 100
   - Installs: 50
   - Custom: 0-49

5. **Use descriptive task IDs**
   - Follow the format: `platform:category:operation[:parameter]`
   - Makes debugging easier
   - Enables proper deduplication

## Future Enhancements

- [ ] Parallel task execution (for independent tasks)
- [ ] Task caching (skip if already completed in previous run)
- [ ] Rollback support (undo tasks on failure)
- [ ] Task progress reporting
- [ ] Dry-run mode (show what would be executed)

---

**Part of the [Genesis](../README.md) project**

