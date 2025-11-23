# Architecture

Learn about Genesis's internal architecture and design decisions.

## Overview

Genesis is built with a modular, plugin-based architecture that emphasizes:
- **Declarative configuration**
- **Cross-platform support**
- **Task deduplication**
- **Type safety**

## Core Components

### 1. Configuration System

Parses and validates user configuration:

```
genesis.config.ts → Parser → Validator → Config Object
```

**Features:**
- TypeScript and YAML support
- Schema validation
- Type safety

### 2. Plugin System

Manages plugin lifecycle and execution:

```
Plugin Registration → Detection → Task Registration → Execution → Validation
```

**Features:**
- Plugin discovery and loading
- Dependency resolution
- Lifecycle management

### 3. Task Registry

Deduplicates and executes system-level tasks:

```
Task Registration → Deduplication → Priority Sorting → Execution
```

**Features:**
- Task deduplication by ID
- Priority-based execution
- Dependency resolution

### 4. Platform Abstraction

Provides cross-platform utilities:

```
Platform Detection → Package Manager Selection → Command Execution
```

**Features:**
- Automatic platform detection
- Package manager abstraction
- Shell command execution

## Three-Phase Execution Model

Genesis uses a three-phase execution model for optimal performance:

### Phase 1: Task Registration

```typescript
for (const plugin of plugins) {
  if (plugin.registerTasks) {
    await plugin.registerTasks(runtime);
  }
}
```

**Purpose:** Collect all system-level prerequisites

### Phase 2: Task Execution

```typescript
const taskResults = await taskRegistry.executeAll();
```

**Purpose:** Execute system tasks with deduplication

### Phase 3: Plugin Installation

```typescript
for (const plugin of plugins) {
  if (plugin.apply) {
    await plugin.apply(runtime);
  }
}
```

**Purpose:** Perform plugin-specific installations

## Data Flow

```
User Config
    ↓
Config Parser
    ↓
Plugin Loader
    ↓
Plugin Executor
    ├─→ Phase 1: Register Tasks
    ├─→ Phase 2: Execute Tasks (deduplicated)
    └─→ Phase 3: Install Plugins
    ↓
Validation
    ↓
Results
```

## Task Registry Architecture

### Task Identification

Tasks are identified by unique IDs:

```
platform:category:operation[:parameter]
```

**Examples:**
- `linux:package-manager:apt-update`
- `macos:package:install:curl`

### Deduplication Logic

```typescript
class TaskRegistry {
  private tasks = new Map<TaskId, Task>();
  
  register(task: Task): void {
    if (!this.tasks.has(task.id)) {
      this.tasks.set(task.id, task);
    }
    // Duplicate tasks are ignored
  }
}
```

### Execution Order

1. **Priority sorting** - Higher priority tasks first
2. **Dependency resolution** - Topological sort
3. **Sequential execution** - One task at a time

## Plugin Architecture

### Plugin Interface

```typescript
interface GenesisPlugin<TOptions> {
  id: string;
  category: "tool" | "sdk" | "language";
  dependsOn?: string[];
  
  detect?(runtime: PluginRuntime<TOptions>): Promise<DetectResult>;
  registerTasks?(runtime: PluginRuntime<TOptions>): Promise<void>;
  apply?(runtime: PluginRuntime<TOptions>): Promise<ApplyResult>;
  validate?(runtime: PluginRuntime<TOptions>): Promise<ValidateResult>;
}
```

### Plugin Runtime

```typescript
interface PluginRuntime<TOptions> {
  instance: GenesisPluginInstance<TOptions>;
  options: TOptions;
  context: GenesisPluginContext;
}

interface GenesisPluginContext {
  cwd: string;
  env: NodeJS.ProcessEnv;
  logger: Logger;
  taskRegistry: TaskRegistry;
}
```

## Design Decisions

### Why Three Phases?

**Problem:** Plugins need system dependencies during installation.

**Solution:** Separate task registration from execution.

**Benefits:**
- Dependencies available when needed
- Deduplication across all plugins
- Clean separation of concerns

### Why Task Registry?

**Problem:** Multiple plugins run the same system commands.

**Solution:** Central registry with deduplication.

**Benefits:**
- 50% faster execution
- Guaranteed dependency availability
- Scalable to any number of plugins

### Why TypeScript-First?

**Problem:** Configuration errors are hard to debug.

**Solution:** TypeScript with full type safety.

**Benefits:**
- Catch errors at compile time
- IntelliSense and autocomplete
- Better developer experience

## Performance Optimizations

### 1. Task Deduplication

Eliminates redundant operations:

```
Without: apt-update × 5 plugins = 5 executions
With: apt-update × 5 plugins = 1 execution
```

### 2. Lazy Loading

Plugins loaded only when needed:

```typescript
// Only load plugins that are configured
const plugins = await loadPlugins(config);
```

### 3. Parallel Detection

Detection runs in parallel:

```typescript
await Promise.all(
  plugins.map(plugin => plugin.detect(runtime))
);
```

## Error Handling

### Graceful Degradation

```typescript
try {
  await plugin.apply(runtime);
} catch (error) {
  logger.error(`Failed to install ${plugin.id}: ${error.message}`);
  // Continue with other plugins
}
```

### Detailed Error Messages

```typescript
throw new Error(
  `Failed to install Node.js: NVM installation failed. ` +
  `Please check your internet connection and try again.`
);
```

## Extensibility

### Custom Plugins

Users can create custom plugins:

```typescript
export function myTool(options) {
  return {
    id: "my-tool",
    category: "tool",
    module: "@my-org/genesis-plugin-my-tool",
    options,
  };
}
```

### Plugin Hooks

Plugins can hook into the lifecycle:

```typescript
{
  detect: async (runtime) => { /* ... */ },
  registerTasks: async (runtime) => { /* ... */ },
  apply: async (runtime) => { /* ... */ },
  validate: async (runtime) => { /* ... */ },
}
```

## Future Architecture

### Planned Improvements

- **Parallel task execution** - Execute independent tasks in parallel
- **Caching** - Cache detection results
- **Rollback** - Undo failed installations
- **Dry run** - Preview changes without executing

## What's Next?

- [Task Registry](/guide/task-registry) - Deep dive into task deduplication
- [Plugin Development](/guide/plugin-development) - Create custom plugins
- [API Reference](/api/core) - Complete API documentation

