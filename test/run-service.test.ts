import test from 'node:test';
import assert from 'node:assert/strict';
import { RunController, type RunSnapshot } from '../src/controller.js';
import { RunService, type RunStore } from '../src/run-service.js';

class MemoryRunStore implements RunStore {
  private readonly runs = new Map<string, RunSnapshot>();

  async load(runId: string): Promise<RunSnapshot | undefined> {
    const snapshot = this.runs.get(runId);
    return snapshot ? structuredClone(snapshot) : undefined;
  }

  async save(snapshot: RunSnapshot): Promise<void> {
    await Promise.resolve();
    this.runs.set(snapshot.runId, structuredClone(snapshot));
  }
}

test('concurrent mutations preserve both run updates inside one controller process', async () => {
  const store = new MemoryRunStore();
  const initial = RunController.create({
    projectId: 'project',
    runId: 'run',
    sourceRevision: 'source',
    nodes: [
      { id: 'a', kind: 'implementation', dependsOn: [], acceptanceChecks: ['a:accept'] },
      { id: 'b', kind: 'implementation', dependsOn: [], acceptanceChecks: ['b:accept'] }
    ]
  });
  await store.save(initial.snapshot());
  const service = new RunService(store);

  const [aLease, bLease] = await Promise.all([
    service.claimNode('run', 'a', 'worker-a', 60_000, 1_000),
    service.claimNode('run', 'b', 'worker-b', 60_000, 1_000)
  ]);

  const snapshot = await service.getRun('run');
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]));
  assert.equal(byId.get('a')?.status, 'running');
  assert.equal(byId.get('b')?.status, 'running');
  assert.equal(byId.get('a')?.lease?.id, aLease.id);
  assert.equal(byId.get('b')?.lease?.id, bLease.id);
});
