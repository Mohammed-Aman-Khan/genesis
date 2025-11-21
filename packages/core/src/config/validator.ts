import { z } from "zod";
import {
  GENESIS_PLUGIN_CATEGORIES,
  type GenesisConfig,
  type GenesisPluginInstance,
  type RepoSpec,
  type ScriptSpec,
} from "./schema.js";

const pluginCategoryEnum = z.enum(GENESIS_PLUGIN_CATEGORIES);

const pluginInstanceSchema: z.ZodType<GenesisPluginInstance> = z.object({
  id: z.string(),
  category: pluginCategoryEnum,
  module: z.string(),
  options: z.unknown().optional(),
});

const repoSpecSchema: z.ZodType<RepoSpec> = z.object({
  url: z.string(),
  folder: z.string(),
});

const scriptSpecSchema: z.ZodType<ScriptSpec> = z.object({
  name: z.string(),
  command: z.string(),
  description: z.string().optional(),
});

const genesisConfigSchema: z.ZodType<GenesisConfig> = z.object({
  tools: z.array(pluginInstanceSchema).optional(),
  sdks: z.array(pluginInstanceSchema).optional(),
  languages: z.array(pluginInstanceSchema).optional(),
  repositories: z.array(repoSpecSchema).optional(),
  scripts: z.array(scriptSpecSchema).optional(),
  env: z.record(z.string(), z.string()).optional(),
});

export function validateConfig(value: unknown): GenesisConfig {
  const parsed = genesisConfigSchema.parse(value);
  return parsed;
}
