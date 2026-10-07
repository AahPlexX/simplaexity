import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { RunController } from '../src/controller.js';
import { FileRunStore } from '../src/store.js';

async function withStore(run: (store: FileRunStore, directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'simplaexity-store-'));
  try { await run(new FileRunStore(directory), directory); } finally { await rm(directory, { recursive: true, force: true }); }
}

test('load returns undefined when a run does not exist', async () => { await withStore(async (store) => { assert.equal(await store.load('missing'), undefined); }); });

test('save persists a run snapshot that can be restored after restart', async () => {
  await withStore(async (store, directory) => {
    const controller = RunController.create({ projectId: 'project', runId: 'run-1', sourceRevision: 'abc123', now: '2026-10-06T19:00:00-05:00', nodes: [{ id: 'inspect', kind: 'implementation', dependsOn: [], acceptanceChecks: ['inspect:accept'] }] });
    const lease = controller.claimNode('inspect', 'worker', 1_000, 60_000);
    await store.save(controller.snapshot());
    const loaded = await new FileRunStore(directory).load('run-1');
    assert.deepEqual(loaded, controller.snapshot());
    assert.equal(loaded?.nodes[0]?.lease?.id, lease.id);
  });
});

test('run ids cannot escape the configured store directory', async () => {
  await withStore(async (store) => {
    const controller = RunController.create({ projectId: 'project', runId: '../outside', sourceRevision: 'abc123', nodes: [{ id: 'inspect', kind: 'implementation', dependsOn: [], acceptanceChecks: ['inspect:accept'] }] });
    await store.save(controller.snapshot());
    assert.deepEqual(await store.load('../outside'), controller.snapshot());
  });
});
