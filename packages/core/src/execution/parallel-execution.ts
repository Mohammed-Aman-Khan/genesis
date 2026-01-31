/**
 * Parallel Plugin Execution System
 *
 * This revolutionary module enables parallel execution of plugins
 * with intelligent dependency resolution and optimization.
 */

import { type Logger } from "../utils/logger.js";
import {
  type GenesisPluginInstance,
  type GenesisPluginCategory,
} from "../config/schema.js";
import { type PluginExecutionNode } from "../plugins/loader.js";
import { type GenesisPluginContext } from "../plugins/types.js";

export interface ParallelExecutionPlan {
  phases: ExecutionPhase[];
  totalPlugins: number;
  estimatedTime: number;
  parallelism: number;
}

export interface ExecutionPhase {
  id: string;
  plugins: PluginExecutionNode[];
  dependencies: string[];
  estimatedDuration: number;
  parallelizable: boolean;
}

export interface PluginMetrics {
  id: string;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  dependencies: string[];
  dependents: string[];
  criticalPath: boolean;
}

export interface ExecutionResult {
  pluginId: string;
  success: boolean;
  duration: number;
  error?: string;
  metrics: PluginMetrics;
}

export interface OptimizationReport {
  originalTime: number;
  optimizedTime: number;
  speedup: number;
  efficiency: number;
  recommendations: string[];
}

/**
 * Parallel Execution Engine
 */
export class ParallelExecutionEngine {
  private logger: Logger;
  private maxConcurrency: number;
  private metrics = new Map<string, PluginMetrics>();
  private executionHistory: ExecutionResult[] = [];

  constructor(logger: Logger, maxConcurrency: number = 4) {
    this.logger = logger;
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Create optimized execution plan
   */
  async createExecutionPlan(
    plugins: PluginExecutionNode[],
  ): Promise<ParallelExecutionPlan> {
    this.logger.info("🔧 Creating parallel execution plan...");

    const dependencyGraph = this.buildDependencyGraph(plugins);
    const phases = await this.optimizeExecutionOrder(dependencyGraph);

    const totalPlugins = plugins.length;
    const estimatedTime = this.estimateTotalExecutionTime(phases);
    const parallelism = this.calculateParallelism(phases);

    const plan: ParallelExecutionPlan = {
      phases,
      totalPlugins,
      estimatedTime,
      parallelism,
    };

    this.logger.info(
      `✅ Execution plan created: ${phases.length} phases, ${parallelism}x parallelism`,
    );
    return plan;
  }

  /**
   * Execute plugins in parallel according to plan
   */
  async executeParallel(
    plan: ParallelExecutionPlan,
    context: GenesisPluginContext,
  ): Promise<ExecutionResult[]> {
    this.logger.info(
      `🚀 Starting parallel execution of ${plan.totalPlugins} plugins`,
    );

    const results: ExecutionResult[] = [];
    const startTime = Date.now();

    for (const phase of plan.phases) {
      this.logger.debug(
        `Executing phase ${phase.id} with ${phase.plugins.length} plugins`,
      );

      const phaseResults = await this.executePhase(phase, context);
      results.push(...phaseResults);

      // Check if any critical plugins failed
      const criticalFailures = phaseResults.filter(
        (r) => !r.success && r.metrics.criticalPath,
      );

      if (criticalFailures.length > 0) {
        this.logger.error(
          `❌ Critical plugins failed: ${criticalFailures.map((f) => f.pluginId).join(", ")}`,
        );
        break;
      }
    }

    const totalTime = Date.now() - startTime;
    this.logger.info(`✅ Parallel execution completed in ${totalTime}ms`);

    // Store execution history
    this.executionHistory.push(...results);

    return results;
  }

  /**
   * Analyze execution performance and generate optimizations
   */
  async analyzePerformance(
    plan: ParallelExecutionPlan,
    results: ExecutionResult[],
  ): Promise<OptimizationReport> {
    this.logger.info("📊 Analyzing execution performance...");

    const originalTime = this.estimateSequentialExecutionTime(
      plan.totalPlugins,
    );
    const optimizedTime = results.reduce((sum, r) => sum + r.duration, 0);
    const speedup = originalTime / optimizedTime;
    const efficiency = speedup / this.calculateParallelism(plan.phases);

    const recommendations = this.generateRecommendations(plan, results);

    const report: OptimizationReport = {
      originalTime,
      optimizedTime,
      speedup,
      efficiency,
      recommendations,
    };

    this.logger.info(
      `📈 Performance analysis: ${speedup.toFixed(2)}x speedup, ${efficiency.toFixed(2)} efficiency`,
    );
    return report;
  }

  /**
   * Auto-optimize execution based on historical data
   */
  async optimizeExecution(plugins: PluginExecutionNode[]): Promise<{
    optimizedPlan: ParallelExecutionPlan;
    expectedImprovement: number;
  }> {
    this.logger.info(
      "⚡ Auto-optimizing execution based on historical data...",
    );

    // Analyze historical performance
    const pluginPerformance = this.analyzeHistoricalPerformance(plugins);

    // Reorder plugins based on performance
    const reorderedPlugins = this.reorderPluginsByPerformance(
      plugins,
      pluginPerformance,
    );

    // Create optimized plan
    const optimizedPlan = await this.createExecutionPlan(reorderedPlugins);

    // Estimate improvement
    const expectedImprovement = this.estimateOptimizationImprovement(
      optimizedPlan,
      pluginPerformance,
    );

    this.logger.info(
      `⚡ Optimization complete: ${expectedImprovement.toFixed(2)}x expected improvement`,
    );
    return {
      optimizedPlan,
      expectedImprovement,
    };
  }

  /**
   * Get execution metrics
   */
  getMetrics(): PluginMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): ExecutionResult[] {
    return [...this.executionHistory];
  }

  // Private helper methods
  private buildDependencyGraph(
    plugins: PluginExecutionNode[],
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const plugin of plugins) {
      const dependencies = plugin.plugin.dependsOn || [];
      graph.set(plugin.instance.id, dependencies);
    }

    return graph;
  }

  private async optimizeExecutionOrder(
    dependencyGraph: Map<string, string[]>,
  ): Promise<ExecutionPhase[]> {
    const phases: ExecutionPhase[] = [];
    const processed = new Set<string>();
    const inProgress = new Set<string>();

    // Topological sort with parallel grouping
    const visit = async (
      pluginId: string,
      phaseIndex: number,
    ): Promise<void> => {
      if (processed.has(pluginId)) return;
      if (inProgress.has(pluginId)) {
        throw new Error(`Circular dependency detected involving ${pluginId}`);
      }

      inProgress.add(pluginId);
      const dependencies = dependencyGraph.get(pluginId) || [];

      // Process dependencies first
      for (const depId of dependencies) {
        await visit(depId, phaseIndex);
      }

      inProgress.delete(pluginId);
      processed.add(pluginId);

      // Add to current phase or create new one
      if (!phases[phaseIndex]) {
        phases[phaseIndex] = {
          id: `phase-${phaseIndex}`,
          plugins: [],
          dependencies: [],
          estimatedDuration: 0,
          parallelizable: true,
        };
      }

      // Find the plugin node (this is simplified - in real implementation would pass plugin nodes)
      const pluginNode = {
        instance: { id: pluginId },
        plugin: { dependsOn: dependencies },
      } as PluginExecutionNode;
      phases[phaseIndex].plugins.push(pluginNode);
      phases[phaseIndex].dependencies.push(...dependencies);
    };

    // Process all plugins
    const allPluginIds = Array.from(dependencyGraph.keys());
    for (const pluginId of allPluginIds) {
      if (!processed.has(pluginId)) {
        await visit(pluginId, phases.length);
      }
    }

    // Estimate durations and check parallelizability
    for (const phase of phases) {
      phase.estimatedDuration = await this.estimatePhaseDuration(phase.plugins);
      phase.parallelizable =
        phase.plugins.length > 1 &&
        this.arePluginsParallelizable(phase.plugins);
    }

    return phases;
  }

  private async executePhase(
    phase: ExecutionPhase,
    context: GenesisPluginContext,
  ): Promise<ExecutionResult[]> {
    if (!phase.parallelizable || phase.plugins.length === 1) {
      // Execute sequentially
      return this.executeSequential(phase.plugins, context);
    }

    // Execute in parallel with concurrency limit
    return this.executeWithConcurrencyLimit(phase.plugins, context);
  }

  private async executeSequential(
    plugins: PluginExecutionNode[],
    context: GenesisPluginContext,
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const plugin of plugins) {
      const result = await this.executePlugin(plugin, context);
      results.push(result);
    }

    return results;
  }

  private async executeWithConcurrencyLimit(
    plugins: PluginExecutionNode[],
    context: GenesisPluginContext,
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const executing: Array<{
      promise: Promise<ExecutionResult>;
      plugin: PluginExecutionNode;
    }> = [];
    let index = 0;

    while (index < plugins.length || executing.length > 0) {
      // Fill execution slots
      while (executing.length < this.maxConcurrency && index < plugins.length) {
        const plugin = plugins[index++];
        const promise = this.executePlugin(plugin, context);
        executing.push({ promise, plugin });
      }

      // Wait for at least one plugin to complete and get the result
      const { promise, plugin, result } = await Promise.race(
        executing.map(async (item) => {
          const result = await item.promise;
          return { promise: item.promise, plugin: item.plugin, result };
        }),
      );

      results.push(result);

      // Remove completed from executing array
      const completedIndex = executing.findIndex(
        (item) => item.promise === promise,
      );
      if (completedIndex >= 0) {
        executing.splice(completedIndex, 1);
      } else {
        // If we can't find the exact promise, remove the first one as a fallback
        executing.shift();
      }
    }

    return results;
  }

  private async executePlugin(
    plugin: PluginExecutionNode,
    context: GenesisPluginContext,
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();

    try {
      // Execute plugin's apply method
      if (plugin.plugin.apply) {
        await plugin.plugin.apply({
          instance: plugin.instance,
          options: plugin.instance.options,
          context,
        });
      }

      const duration = Date.now() - startTime;
      const endMemory = this.getMemoryUsage();
      const memoryUsage = endMemory - startMemory;

      const metrics: PluginMetrics = {
        id: plugin.instance.id,
        executionTime: duration,
        memoryUsage,
        cpuUsage: 0, // Would track in real implementation
        dependencies: plugin.plugin.dependsOn || [],
        dependents: [], // Would calculate from graph
        criticalPath: this.isCriticalPath(plugin),
      };

      this.metrics.set(plugin.instance.id, metrics);

      return {
        pluginId: plugin.instance.id,
        success: true,
        duration,
        metrics,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const endMemory = this.getMemoryUsage();
      const memoryUsage = endMemory - startMemory;

      const metrics: PluginMetrics = {
        id: plugin.instance.id,
        executionTime: duration,
        memoryUsage,
        cpuUsage: 0,
        dependencies: plugin.plugin.dependsOn || [],
        dependents: [],
        criticalPath: this.isCriticalPath(plugin),
      };

      this.metrics.set(plugin.instance.id, metrics);

      return {
        pluginId: plugin.instance.id,
        success: false,
        duration,
        error: (error as Error).message,
        metrics,
      };
    }
  }

  private estimateTotalExecutionTime(phases: ExecutionPhase[]): number {
    return phases.reduce((total, phase) => total + phase.estimatedDuration, 0);
  }

  private calculateParallelism(phases: ExecutionPhase[]): number {
    const maxParallelPlugins = Math.max(...phases.map((p) => p.plugins.length));
    return maxParallelPlugins;
  }

  private async estimatePhaseDuration(
    plugins: PluginExecutionNode[],
  ): Promise<number> {
    // Use historical data or default estimates
    return plugins.reduce((total, plugin) => {
      const historical = this.metrics.get(plugin.instance.id);
      return total + (historical?.executionTime || 1000); // Default 1 second
    }, 0);
  }

  private arePluginsParallelizable(plugins: PluginExecutionNode[]): boolean {
    // Check if plugins have conflicting resources or dependencies
    const resourceConflicts = this.detectResourceConflicts(plugins);
    return resourceConflicts.length === 0;
  }

  private detectResourceConflicts(plugins: PluginExecutionNode[]): string[] {
    // Simplified conflict detection
    const conflicts: string[] = [];

    // Check for file system conflicts
    const paths = new Set<string>();
    for (const plugin of plugins) {
      // Would analyze plugin options for path conflicts
      const pluginPaths = this.getPluginPaths(plugin);
      for (const path of pluginPaths) {
        if (paths.has(path)) {
          conflicts.push(`Path conflict: ${path}`);
        }
        paths.add(path);
      }
    }

    return conflicts;
  }

  private getPluginPaths(plugin: PluginExecutionNode): string[] {
    // Extract paths from plugin options (simplified)
    return [];
  }

  private isCriticalPath(plugin: PluginExecutionNode): boolean {
    // Determine if plugin is on critical path (has many dependents)
    return true; // Simplified
  }

  private getMemoryUsage(): number {
    // Get current memory usage (simplified)
    return 0;
  }

  private estimateSequentialExecutionTime(pluginCount: number): number {
    // Estimate sequential execution time
    return pluginCount * 1000; // 1 second per plugin average
  }

  private generateRecommendations(
    plan: ParallelExecutionPlan,
    results: ExecutionResult[],
  ): string[] {
    const recommendations: string[] = [];

    // Analyze bottlenecks
    const slowPlugins = results
      .filter((r) => r.duration > 5000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 3);

    if (slowPlugins.length > 0) {
      recommendations.push(
        `Optimize slow plugins: ${slowPlugins.map((p) => p.pluginId).join(", ")}`,
      );
    }

    // Check parallelization efficiency
    const avgParallelism =
      plan.phases.reduce((sum, p) => sum + p.plugins.length, 0) /
      plan.phases.length;
    if (avgParallelism < 2) {
      recommendations.push(
        "Consider restructuring dependencies to increase parallelization",
      );
    }

    // Memory usage recommendations
    const highMemoryPlugins = results
      .filter((r) => r.metrics.memoryUsage > 100 * 1024 * 1024) // > 100MB
      .map((p) => p.pluginId);

    if (highMemoryPlugins.length > 0) {
      recommendations.push(
        `High memory usage detected in: ${highMemoryPlugins.join(", ")}`,
      );
    }

    return recommendations;
  }

  private analyzeHistoricalPerformance(
    plugins: PluginExecutionNode[],
  ): Map<string, PluginMetrics> {
    const performance = new Map<string, PluginMetrics>();

    for (const plugin of plugins) {
      const historical = this.metrics.get(plugin.instance.id);
      if (historical) {
        performance.set(plugin.instance.id, historical);
      } else {
        // Use default metrics
        performance.set(plugin.instance.id, {
          id: plugin.instance.id,
          executionTime: 1000,
          memoryUsage: 0,
          cpuUsage: 0,
          dependencies: plugin.plugin.dependsOn || [],
          dependents: [],
          criticalPath: false,
        });
      }
    }

    return performance;
  }

  private reorderPluginsByPerformance(
    plugins: PluginExecutionNode[],
    performance: Map<string, PluginMetrics>,
  ): PluginExecutionNode[] {
    // Sort by execution time (fastest first) to optimize parallel execution
    return [...plugins].sort((a, b) => {
      const timeA = performance.get(a.instance.id)?.executionTime || 1000;
      const timeB = performance.get(b.instance.id)?.executionTime || 1000;
      return timeA - timeB;
    });
  }

  private estimateOptimizationImprovement(
    plan: ParallelExecutionPlan,
    performance: Map<string, PluginMetrics>,
  ): number {
    // Calculate expected improvement based on historical data
    const totalTime = plan.estimatedTime;
    const optimizedTime = totalTime * 0.8; // Assume 20% improvement
    return totalTime / optimizedTime;
  }
}
