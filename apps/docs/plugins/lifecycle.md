# Plugin Lifecycle

Understanding the Genesis plugin lifecycle.

## Overview

Every Genesis plugin goes through a four-phase lifecycle:

1. **Detection** - Check if tool is installed
2. **Task Registration** - Register system prerequisites
3. **Installation** - Install the tool
4. **Validation** - Verify installation

## Lifecycle Phases

### Phase 0: Detection

**Purpose:** Check if the tool is already installed and at the correct version.

**When:** Before any installation begins

**Method:** `detect(runtime): Promise<DetectResult>`

**Example:**

```typescript
async detect(runtime) {
  try {
    const result = await runCommand("node", ["--version"], {
      cwd: runtime.context.cwd,
      env: runtime.context.env,
    });
    
    if (result.code === 0) {
      const version = result.stdout.trim();
      return {
        ok: true,
        details: `Node.js ${version} is installed`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      details: "Node.js is not installed",
    };
  }
}
```

### Phase 1: Task Registration

**Purpose:** Register system-level prerequisites that need to be installed.

**When:** After detection, before task execution

**Method:** `registerTasks(runtime): Promise<void>`

**Example:**

```typescript
async registerTasks(runtime) {
  const { taskRegistry } = runtime.context;
  
  // Register package manager update (deduplicated!)
  taskRegistry.register(
    createPackageManagerUpdateTask(
      runtime.context.cwd,
      runtime.context.env
    )
  );
  
  // Register system packages
  taskRegistry.register(
    createPackageInstallTask(
      "curl",
      runtime.context.cwd,
      runtime.context.env
    )
  );
}
```

### Phase 2: Task Execution

**Purpose:** Execute all registered system tasks with deduplication.

**When:** After all plugins register tasks, before plugin installation

**Handled by:** Task Registry (automatic)

**Example output:**

```
Executing system tasks...
  ✓ linux:package-manager:apt-update (deduplicated)
  ✓ linux:package:install:curl
  ✓ linux:package:install:python3.11
```

### Phase 3: Installation

**Purpose:** Perform plugin-specific installation work.

**When:** After system tasks complete

**Method:** `apply(runtime): Promise<ApplyResult>`

**Example:**

```typescript
async apply(runtime) {
  const { options, context } = runtime;
  const { logger } = context;
  
  logger.info(`Installing Node.js ${options.version}...`);
  
  // System dependencies (curl) are now available
  // Install NVM
  await installNvm(context);
  
  // Install Node.js via NVM
  await runCommand("nvm", ["install", options.version], {
    cwd: context.cwd,
    env: context.env,
  });
  
  return {
    ok: true,
    details: `Node.js ${options.version} installed successfully`,
  };
}
```

### Phase 4: Validation

**Purpose:** Verify the installation was successful.

**When:** After installation completes

**Method:** `validate(runtime): Promise<ValidateResult>`

**Example:**

```typescript
async validate(runtime) {
  // Usually just reuse detection logic
  return this.detect!(runtime);
}
```

## Complete Lifecycle Example

```typescript
export function createPlugin(
  instance: GenesisPluginInstance<NodeOptions>
): GenesisPlugin<NodeOptions> {
  return {
    id: instance.id,
    category: instance.category,
    
    // Phase 0: Detection
    async detect(runtime) {
      // Check if Node.js is installed
      // Return { ok: boolean, details: string }
    },
    
    // Phase 1: Task Registration
    async registerTasks(runtime) {
      // Register apt-update, install curl
      // No return value
    },
    
    // Phase 3: Installation
    async apply(runtime) {
      // Install NVM and Node.js
      // Return { ok: boolean, details: string }
    },
    
    // Phase 4: Validation
    async validate(runtime) {
      // Verify installation
      // Return { ok: boolean, details: string }
    },
  };
}
```

## Execution Flow

```
User runs: genesis apply
    ↓
Load configuration
    ↓
Load plugins
    ↓
┌─────────────────────────────────────┐
│ Phase 0: Detection (parallel)       │
│ - Check if tools are installed      │
│ - Skip if already correct version   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Phase 1: Task Registration          │
│ - Plugin A registers tasks          │
│ - Plugin B registers tasks          │
│ - Tasks collected in registry       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Phase 2: Task Execution              │
│ - Deduplicate tasks by ID           │
│ - Sort by priority and dependencies │
│ - Execute sequentially               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Phase 3: Plugin Installation         │
│ - Plugin A installs                  │
│ - Plugin B installs                  │
│ - System dependencies available      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Phase 4: Validation (parallel)       │
│ - Verify Plugin A installation       │
│ - Verify Plugin B installation       │
└─────────────────────────────────────┘
    ↓
Report results
```

## Lifecycle Methods

### Required Methods

None! All methods are optional.

### Optional Methods

- `detect?` - Recommended for all plugins
- `registerTasks?` - Use if plugin needs system packages
- `apply?` - Required if plugin installs anything
- `validate?` - Recommended for verification

### Minimal Plugin

```typescript
export function createPlugin(instance) {
  return {
    id: instance.id,
    category: instance.category,
    
    // Only implement what you need
    async apply(runtime) {
      // Just install the tool
    },
  };
}
```

### Full Plugin

```typescript
export function createPlugin(instance) {
  return {
    id: instance.id,
    category: instance.category,
    
    // Implement all phases
    async detect(runtime) { /* ... */ },
    async registerTasks(runtime) { /* ... */ },
    async apply(runtime) { /* ... */ },
    async validate(runtime) { /* ... */ },
  };
}
```

## Best Practices

### 1. Always Implement Detection

```typescript
// ✅ Good: Check before installing
async detect(runtime) {
  // Check if tool exists
}

async apply(runtime) {
  const detectResult = await this.detect!(runtime);
  if (detectResult.ok) {
    return { ok: true, details: "Already installed" };
  }
  // Install...
}
```

### 2. Use Task Registry for System Operations

```typescript
// ✅ Good: Register system tasks
async registerTasks(runtime) {
  taskRegistry.register(
    createPackageInstallTask("curl", cwd, env)
  );
}

// ❌ Bad: Install in apply()
async apply(runtime) {
  await runCommand("sudo", ["apt-get", "install", "curl"]);
}
```

### 3. Validate After Installation

```typescript
// ✅ Good: Verify installation
async validate(runtime) {
  return this.detect!(runtime);
}
```

### 4. Provide Detailed Feedback

```typescript
// ✅ Good: Detailed messages
return {
  ok: true,
  details: "Node.js 20.10.0 installed successfully via NVM",
};

// ❌ Bad: Vague messages
return {
  ok: true,
  details: "Done",
};
```

## What's Next?

- [Creating a Plugin](/plugins/creating-plugin) - Build your own plugin
- [Best Practices](/plugins/best-practices) - Plugin development tips
- [Task Registry](/guide/task-registry) - Learn about task deduplication

