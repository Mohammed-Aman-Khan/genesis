import { type GenesisPluginCategory } from "../config/schema.js";
import { type PluginExecutionNode } from "./loader.js";
import { type GenesisPluginContext } from "./types.js";

export type PluginStatus = "unknown" | "present" | "missing";

export interface DetectSummary {
  id: string;
  category: GenesisPluginCategory;
  status: PluginStatus;
  details?: string;
}

export interface ApplySummary {
  id: string;
  category: GenesisPluginCategory;
  ok: boolean;
  didChange: boolean;
  details?: string;
}

export interface ValidateSummary {
  id: string;
  category: GenesisPluginCategory;
  ok: boolean;
  message?: string;
}

function getDependencies(node: PluginExecutionNode): string[] {
  return node.plugin.dependsOn ?? [];
}

export function buildPluginGraph(
  nodes: PluginExecutionNode[]
): PluginExecutionNode[] {
  const result: PluginExecutionNode[] = [];
  const temp = new Set<string>();
  const perm = new Set<string>();
  const byId = new Map<string, PluginExecutionNode>();
  for (const node of nodes) {
    byId.set(node.instance.id, node);
  }
  function visit(id: string): void {
    if (perm.has(id)) {
      return;
    }
    if (temp.has(id)) {
      throw new Error(`Cyclic plugin dependency involving '${id}'`);
    }
    const node = byId.get(id);
    if (!node) {
      throw new Error(`Missing plugin '${id}' referenced in dependency`);
    }
    temp.add(id);
    for (const dep of getDependencies(node)) {
      visit(dep);
    }
    temp.delete(id);
    perm.add(id);
    result.push(node);
  }
  for (const node of nodes) {
    visit(node.instance.id);
  }
  return result;
}

export async function runDetect(
  nodes: PluginExecutionNode[],
  context: GenesisPluginContext
): Promise<DetectSummary[]> {
  const result: DetectSummary[] = [];
  for (const node of nodes) {
    if (!node.plugin.detect) {
      result.push({
        id: node.instance.id,
        category: node.instance.category,
        status: "unknown",
      });
      continue;
    }
    const detectResult = await node.plugin.detect({
      instance: node.instance,
      options: node.instance.options,
      context,
    });
    result.push({
      id: node.instance.id,
      category: node.instance.category,
      status: detectResult.ok ? "present" : "missing",
      details: detectResult.details,
    });
  }
  return result;
}

export async function runApply(
  nodes: PluginExecutionNode[],
  context: GenesisPluginContext
): Promise<ApplySummary[]> {
  const result: ApplySummary[] = [];

  // Phase 1: Register system-level tasks
  context.logger.debug("Phase 1: Registering system-level tasks...");
  for (const node of nodes) {
    if (node.plugin.registerTasks) {
      await node.plugin.registerTasks({
        instance: node.instance,
        options: node.instance.options,
        context,
      });
    }
  }

  // Phase 2: Execute all registered system tasks (deduplicated)
  context.logger.debug("Phase 2: Executing system tasks...");
  const taskResults = await context.taskRegistry.executeAll();

  // Check if any critical tasks failed
  const failedTasks = Array.from(taskResults.entries()).filter(
    ([_, result]) => !result.ok
  );
  if (failedTasks.length > 0) {
    context.logger.warn(
      `${failedTasks.length} system task(s) failed. Plugin installation may be affected.`
    );
  }

  // Phase 3: Execute plugin apply methods
  context.logger.debug("Phase 3: Executing plugin apply methods...");
  for (const node of nodes) {
    if (!node.plugin.apply) {
      result.push({
        id: node.instance.id,
        category: node.instance.category,
        ok: true,
        didChange: false,
      });
      continue;
    }
    const applyResult = await node.plugin.apply({
      instance: node.instance,
      options: node.instance.options,
      context,
    });
    result.push({
      id: node.instance.id,
      category: node.instance.category,
      ok: applyResult.ok,
      didChange: applyResult.didChange,
      details: applyResult.details,
    });
  }

  return result;
}

export async function runValidate(
  nodes: PluginExecutionNode[],
  context: GenesisPluginContext
): Promise<ValidateSummary[]> {
  const result: ValidateSummary[] = [];
  for (const node of nodes) {
    if (!node.plugin.validate) {
      result.push({
        id: node.instance.id,
        category: node.instance.category,
        ok: true,
      });
      continue;
    }
    const validateResult = await node.plugin.validate({
      instance: node.instance,
      options: node.instance.options,
      context,
    });
    result.push({
      id: node.instance.id,
      category: node.instance.category,
      ok: validateResult.ok,
      message: validateResult.message,
    });
  }
  return result;
}

export async function runDiff(
  nodes: PluginExecutionNode[],
  context: GenesisPluginContext
): Promise<DetectSummary[]> {
  const summaries = await runDetect(nodes, context);
  return summaries;
}
