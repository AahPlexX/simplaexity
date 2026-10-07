import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { ControllerError, type NodeDefinition } from './controller.js';
import { RunService } from './run-service.js';
import { FileRunStore } from './store.js';

export const PUBLIC_TOOL_NAMES = ['claim_node', 'create_run', 'fail_node', 'get_run', 'invalidate_node'] as const;

const nodeDefinitionSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['planning', 'implementation', 'verification', 'delivery']),
  dependsOn: z.array(z.string().min(1)),
  acceptanceChecks: z.array(z.string().min(1)).min(1)
});

export function createServer(storeDirectory: string): McpServer {
  const service = new RunService(new FileRunStore(storeDirectory));
  const server = new McpServer({ name: 'simplaexity', version: '0.1.0' });

  server.registerTool(
    'create_run',
    {
      description: 'Create a dependency-gated simplaexity run.',
      inputSchema: z.object({
        projectId: z.string().min(1),
        runId: z.string().min(1),
        sourceRevision: z.string().min(1),
        nodes: z.array(nodeDefinitionSchema).min(1)
      })
    },
    async ({ projectId, runId, sourceRevision, nodes }) => execute(() => service.createRun({
      projectId,
      runId,
      sourceRevision,
      nodes: nodes as NodeDefinition[]
    }))
  );

  server.registerTool(
    'get_run',
    { description: 'Read the current state of a simplaexity run.', inputSchema: z.object({ runId: z.string().min(1) }) },
    async ({ runId }) => execute(() => service.getRun(runId))
  );

  server.registerTool(
    'claim_node',
    {
      description: 'Claim an eligible node with a fenced execution lease.',
      inputSchema: z.object({
        runId: z.string().min(1),
        nodeId: z.string().min(1),
        workerId: z.string().min(1),
        ttlMs: z.number().int().min(1_000).max(3_600_000).default(300_000)
      })
    },
    async ({ runId, nodeId, workerId, ttlMs }) => execute(() => service.claimNode(runId, nodeId, workerId, ttlMs))
  );

  server.registerTool(
    'fail_node',
    {
      description: 'Record a failed worker attempt. This does not verify completion.',
      inputSchema: z.object({
        runId: z.string().min(1),
        nodeId: z.string().min(1),
        leaseId: z.string().min(1),
        reason: z.string().min(1)
      })
    },
    async ({ runId, nodeId, leaseId, reason }) => execute(() => service.failNode(runId, nodeId, leaseId, reason))
  );

  server.registerTool(
    'invalidate_node',
    {
      description: 'Fail closed by marking a node and its descendants stale after an upstream fact changes.',
      inputSchema: z.object({ runId: z.string().min(1), nodeId: z.string().min(1), reason: z.string().min(1) })
    },
    async ({ runId, nodeId, reason }) => execute(() => service.invalidateNode(runId, nodeId, reason))
  );

  return server;
}

async function execute(operation: () => Promise<unknown>) {
  try {
    const value = await operation();
    return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
  } catch (error) {
    const message = error instanceof ControllerError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : 'Unknown error';
    return { content: [{ type: 'text' as const, text: message }], isError: true };
  }
}
