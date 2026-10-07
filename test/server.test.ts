import test from 'node:test';
import assert from 'node:assert/strict';
import { McpServer } from '@modelcontextprotocol/server';
import { PUBLIC_TOOL_NAMES, createServer } from '../src/server.js';

test('public MCP surface contains only worker-safe foundation tools', () => {
  assert.deepEqual(PUBLIC_TOOL_NAMES, ['claim_node', 'create_run', 'fail_node', 'get_run', 'invalidate_node']);
  assert.equal(PUBLIC_TOOL_NAMES.includes('verify_node'), false);
});

test('createServer returns an official MCP server instance', () => {
  const server = createServer('.simplaexity/test-runs');
  assert.equal(server instanceof McpServer, true);
});
