import { GenesisConfig, GenesisPluginInstance } from "../config/schema.js";
import { GenesisPlugin } from "./types.js";

export interface PluginExecutionNode<TOptions = unknown> {
  instance: GenesisPluginInstance<TOptions>;
  plugin: GenesisPlugin<TOptions>;
}

export function collectPluginInstances(
  config: GenesisConfig
): GenesisPluginInstance[] {
  const result: GenesisPluginInstance[] = [];
  if (config.tools) {
    result.push(...config.tools);
  }
  if (config.sdks) {
    result.push(...config.sdks);
  }
  if (config.languages) {
    result.push(...config.languages);
  }
  return result;
}

async function importPluginModule(moduleId: string): Promise<unknown> {
  const mod = await import(moduleId);
  return mod;
}

export async function loadPlugin(
  instance: GenesisPluginInstance
): Promise<PluginExecutionNode> {
  const mod = await importPluginModule(instance.module);
  const create = (
    mod as { createPlugin?: (instance: GenesisPluginInstance) => GenesisPlugin }
  ).createPlugin;
  if (!create) {
    throw new Error(
      `Plugin module '${instance.module}' does not export createPlugin`
    );
  }
  const plugin = create(instance);
  return { instance, plugin };
}

export async function loadPlugins(
  instances: GenesisPluginInstance[]
): Promise<PluginExecutionNode[]> {
  const result: PluginExecutionNode[] = [];
  for (const instance of instances) {
    const node = await loadPlugin(instance);
    result.push(node);
  }
  return result;
}
