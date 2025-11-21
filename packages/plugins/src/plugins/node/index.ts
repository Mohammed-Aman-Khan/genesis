import {
  type GenesisPlugin,
  type GenesisPluginInstance,
  type PluginRuntime,
  runCommand,
} from "@genesis/core";

export interface NodeOptions {
  version: string;
}

export function node(options: NodeOptions): GenesisPluginInstance<NodeOptions> {
  return {
    id: "node",
    category: "tool",
    module: "@genesis/plugins/node",
    options,
  };
}

function parseNodeVersion(output: string): string | undefined {
  const value = output.trim();
  if (!value) {
    return undefined;
  }
  if (value.startsWith("v")) {
    return value.slice(1);
  }
  return value;
}

async function detectNode(runtime: PluginRuntime<NodeOptions>) {
  const result = await runCommand("node", ["-v"], {
    cwd: runtime.context.cwd,
    env: runtime.context.env,
  });
  if (result.code !== 0) {
    return {
      ok: false,
      details: "Node is not available on PATH",
    };
  }
  const version = parseNodeVersion(result.stdout || result.stderr);
  if (!version) {
    return {
      ok: false,
      details: "Node version could not be determined",
    };
  }
  if (version.startsWith(runtime.options.version)) {
    return {
      ok: true,
      details: `Detected Node ${version}`,
    };
  }
  return {
    ok: false,
    details: `Detected Node ${version} but ${runtime.options.version} is requested`,
  };
}

export function createPlugin(
  instance: GenesisPluginInstance<NodeOptions>
): GenesisPlugin<NodeOptions> {
  return {
    id: instance.id,
    category: instance.category,
    async detect(runtime) {
      return detectNode(runtime);
    },
    async apply(runtime) {
      const detectResult = await detectNode(runtime);
      if (detectResult.ok) {
        return {
          ok: true,
          didChange: false,
          details: detectResult.details,
        };
      }
      return {
        ok: false,
        didChange: false,
        details: detectResult.details,
      };
    },
    async validate(runtime) {
      const detectResult = await detectNode(runtime);
      return {
        ok: detectResult.ok,
        message: detectResult.details,
      };
    },
  };
}
