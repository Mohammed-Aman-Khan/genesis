import {
  type GenesisPluginCategory,
  type GenesisPluginInstance,
} from "../config/schema.js";

export interface DetectResult {
  ok: boolean;
  details?: string;
}

export interface ApplyResult {
  ok: boolean;
  didChange: boolean;
  details?: string;
}

export interface ValidateResult {
  ok: boolean;
  message?: string;
}

export interface GenesisPluginContext {
  cwd: string;
  env: NodeJS.ProcessEnv;
}

export interface PluginRuntime<TOptions = unknown> {
  instance: GenesisPluginInstance<TOptions>;
  options: TOptions;
  context: GenesisPluginContext;
}

export interface GenesisPlugin<TOptions = unknown> {
  id: string;
  category: GenesisPluginCategory;
  dependsOn?: string[];
  detect?(runtime: PluginRuntime<TOptions>): Promise<DetectResult>;
  apply?(runtime: PluginRuntime<TOptions>): Promise<ApplyResult>;
  validate?(runtime: PluginRuntime<TOptions>): Promise<ValidateResult>;
}
