# NVM Implementation for Node.js Plugin

## Overview

The Node.js plugin now supports automatic installation via NVM (Node Version Manager) with comprehensive platform-specific handling, logging, and error management.

## Features

### 1. **NVM Support with Default Enabled**
- Added `use_nvm` flag to `NodeOptions` interface
- Default value: `true` (NVM is preferred installation method)
- Users can opt-out by setting `use_nvm: false` in their config

### 2. **Platform-Specific Handling**

#### macOS/Linux
- Automatic NVM installation using official install script
- Downloads from: `https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh`
- Installs to `~/.nvm` or `$NVM_DIR` if set
- Automatically installs requested Node.js version
- Sets installed version as default using `nvm alias default`

#### Windows
- Detects Windows platform
- Provides comprehensive installation guide for nvm-windows
- Logs step-by-step instructions including:
  - Repository URL
  - Download instructions
  - Installation steps
  - Verification commands
  - Node.js installation commands
- Does NOT attempt automatic installation (as requested)

### 3. **Comprehensive Logging**

All operations use the Genesis Logger with appropriate levels:

- **DEBUG**: Detailed operation steps (e.g., "Downloading NVM install script from...")
- **INFO**: Major operations and success messages (e.g., "Installing NVM...", "NVM installed successfully")
- **WARN**: Non-critical issues (e.g., "Failed to set Node.js as default", Windows automatic installation not supported)
- **ERROR**: Critical failures (e.g., "Failed to install NVM", "Failed to install Node.js")

### 4. **Graceful Error Handling**

- Network failures during NVM installation are caught and reported
- Missing shell profiles are handled gracefully
- NVM installation failures provide actionable error messages
- Node.js installation failures include stderr output for debugging
- All errors return structured results with `ok: false` and descriptive `details`

### 5. **Framework Pattern for Other Plugins**

This implementation establishes patterns that other plugins should follow:

#### Platform Detection Pattern
```typescript
const platform = getPlatform();
if (platform === "windows") {
  // Windows-specific handling
} else {
  // macOS/Linux handling
}
```

#### Logging Pattern
```typescript
const { logger } = runtime.context;
logger.debug("Detailed operation info");
logger.info("User-facing status");
logger.warn("Non-critical issues");
logger.error("Critical failures");
```

#### Error Handling Pattern
```typescript
const result = await someOperation();
if (result.code !== 0) {
  logger.error("Operation failed");
  logger.debug(`stderr: ${result.stderr}`);
  return {
    ok: false,
    details: `Operation failed: ${result.stderr || "Unknown error"}`,
  };
}
```

#### Structured Return Pattern
```typescript
return {
  ok: boolean,
  didChange: boolean,  // For apply() method
  details: string,     // Human-readable message
};
```

## Configuration Examples

### Using NVM (Default)
```yaml
tools:
  - type: node
    version: "20"
    # use_nvm: true is implicit
```

### Using NVM (Explicit)
```yaml
tools:
  - type: node
    version: "20"
    use_nvm: true
```

### Standalone Installation (Opt-out)
```yaml
tools:
  - type: node
    version: "20"
    use_nvm: false
```

### TypeScript Config
```typescript
import { defineConfig } from "@genesis/core";
import { node } from "@genesis/plugins";

export default defineConfig({
  tools: [
    node({
      version: "20",
      use_nvm: true,  // Optional, defaults to true
    }),
  ],
});
```

## Implementation Details

### Core Type Changes

**`packages/core/src/plugins/types.ts`**
- Added `logger: Logger` to `GenesisPluginContext`
- All plugins now receive a logger instance in their runtime context

**`apps/cli/src/lib/runner.ts`**
- Updated all runner functions to pass logger to plugin context
- Ensures consistent logging across all plugin operations

### Node Plugin Changes

**`packages/plugins/src/plugins/node/index.ts`**

New helper functions:
- `getNvmDir()`: Determines NVM installation directory
- `isNvmInstalled()`: Checks if NVM is installed
- `isNvmAvailable()`: Checks if NVM command is available in shell
- `installNvm()`: Installs NVM on macOS/Linux
- `installNodeViaNvm()`: Installs Node.js using NVM
- `logWindowsNvmGuide()`: Displays Windows installation guide

Updated `apply()` method flow:
1. Check if Node.js is already installed (correct version)
2. If Windows: Display installation guide, return
3. If macOS/Linux with `use_nvm: true`:
   - Check if NVM is installed
   - Install NVM if needed
   - Install Node.js via NVM
   - Set as default version
4. If `use_nvm: false`: Display message about standalone installation

## Edge Cases Handled

1. **NVM already installed**: Skips NVM installation, proceeds to Node.js installation
2. **Node.js already installed**: Returns success without changes
3. **Network failures**: Caught and reported with actionable error messages
4. **Windows platform**: Provides manual installation guide instead of failing silently
5. **Missing curl**: Error message includes stderr output for debugging
6. **NVM installation succeeds but Node.js fails**: Returns `didChange: true` to indicate partial success
7. **Setting default version fails**: Logs warning but doesn't fail the entire operation

## Testing

To test the implementation:

```bash
# Build the project
bun run build

# Create a test config
cat > genesis.config.yaml << EOF
tools:
  - type: node
    version: "20"
EOF

# Run apply
genesis apply

# Check logs for:
# - Platform detection
# - NVM installation (if needed)
# - Node.js installation
# - Success/failure messages
```

## Future Enhancements

1. **Standalone Node.js installation**: Implement direct Node.js installation without NVM
2. **Version verification**: Add more robust version matching (semver ranges)
3. **Shell profile detection**: Automatically detect and update the correct shell profile
4. **Windows automation**: Explore chocolatey or scoop for automated Windows installation
5. **NVM version configuration**: Allow users to specify NVM version to install
6. **Offline installation**: Support for air-gapped environments

## Migration Guide

Existing configs will continue to work without changes. The `use_nvm` flag defaults to `true`, so:

**Before:**
```yaml
tools:
  - type: node
    version: "20"
```

**After (same behavior):**
```yaml
tools:
  - type: node
    version: "20"
    # use_nvm: true is now the default
```

To opt-out of NVM:
```yaml
tools:
  - type: node
    version: "20"
    use_nvm: false
```

## Conclusion

This implementation provides a robust, production-ready NVM integration that:
- ✅ Defaults to NVM installation (preferred method)
- ✅ Handles all platforms appropriately
- ✅ Provides comprehensive logging
- ✅ Handles errors gracefully
- ✅ Establishes patterns for other plugins
- ✅ Maintains backward compatibility

