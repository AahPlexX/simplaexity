import { join } from 'node:path';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';

const storeDirectory = process.env.SIMPLAEXITY_RUN_STORE ?? join(process.cwd(), '.simplaexity', 'runs');
void serveStdio(() => createServer(storeDirectory));
console.error('simplaexity MCP server running on stdio');
