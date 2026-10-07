import test from 'node:test';
import assert from 'node:assert/strict';
import { ControllerError, RunController, type NodeDefinition } from '../src/controller.js';

const pass = (checkId: string, candidateRevision = 'candidate-1') => ({ checkId, outcome: 'passed' as const, candidateRevision, observedAt: '2026-10-06T19:00:00-05:00' });
const node = (id: string, dependsOn: string[] = [], acceptanceChecks = [`${id}:accept`]): NodeDefinition => ({ id, kind: 'implementation', dependsOn, acceptanceChecks });

test('rejects a graph with a missing dependency', () => {
  assert.throws(() => RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('child', ['missing'])] }), (error: unknown) => error instanceof ControllerError && error.code === 'INVALID_GRAPH');
});

test('rejects dependency cycles', () => {
  assert.throws(() => RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('a', ['b']), node('b', ['a'])] }), (error: unknown) => error instanceof ControllerError && error.code === 'INVALID_GRAPH');
});

test('rejects nodes with no acceptance checks', () => {
  assert.throws(() => RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('a', [], [])] }), (error: unknown) => error instanceof ControllerError && error.code === 'INVALID_GRAPH');
});

test('keeps dependents blocked until every prerequisite is verified', () => {
  const controller = RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('a'), node('b', ['a'])] });
  assert.equal(controller.getNode('a').status, 'ready');
  assert.equal(controller.getNode('b').status, 'blocked');
  assert.throws(() => controller.claimNode('b', 'worker-b', 1_000, 60_000), /not ready/i);
  const lease = controller.claimNode('a', 'worker-a', 1_000, 60_000);
  controller.verifyNode('a', lease.id, 'candidate-1', [pass('a:accept')], 1_001);
  assert.equal(controller.getNode('a').status, 'verified');
  assert.equal(controller.getNode('b').status, 'ready');
});

test('verification fails closed when evidence is incomplete, failed, or bound to another revision', () => {
  const controller = RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('a', [], ['unit', 'journey'])] });
  const lease = controller.claimNode('a', 'worker', 1_000, 60_000);
  assert.throws(() => controller.verifyNode('a', lease.id, 'candidate-1', [pass('unit')], 1_001), /evidence/i);
  assert.throws(() => controller.verifyNode('a', lease.id, 'candidate-1', [pass('unit'), { ...pass('journey'), outcome: 'failed' }], 1_001), /pass/i);
  assert.throws(() => controller.verifyNode('a', lease.id, 'candidate-1', [pass('unit'), pass('journey', 'candidate-2')], 1_001), /revision/i);
  assert.equal(controller.getNode('a').status, 'running');
});

test('an expired lease cannot verify or fail even before it is superseded', () => {
  const controller = RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('a')] });
  const lease = controller.claimNode('a', 'worker-old', 1_000, 100);
  assert.throws(() => controller.verifyNode('a', lease.id, 'candidate-old', [pass('a:accept', 'candidate-old')], 1_101), (error: unknown) => error instanceof ControllerError && error.code === 'STALE_LEASE');
  assert.throws(() => controller.failNode('a', lease.id, 'late failure', 1_101), (error: unknown) => error instanceof ControllerError && error.code === 'STALE_LEASE');
  assert.equal(controller.getNode('a').status, 'running');
});

test('a superseded lease cannot complete a newer attempt', () => {
  const controller = RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('a')] });
  const oldLease = controller.claimNode('a', 'worker-old', 1_000, 100);
  const newLease = controller.claimNode('a', 'worker-new', 1_101, 100);
  assert.equal(newLease.attempt, 2);
  assert.throws(() => controller.verifyNode('a', oldLease.id, 'candidate-old', [pass('a:accept', 'candidate-old')], 1_102), (error: unknown) => error instanceof ControllerError && error.code === 'STALE_LEASE');
  controller.verifyNode('a', newLease.id, 'candidate-new', [pass('a:accept', 'candidate-new')], 1_102);
  assert.equal(controller.getNode('a').status, 'verified');
});

test('invalidating a prerequisite stales every descendant and clears leases', () => {
  const controller = RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('a'), node('b', ['a']), node('c', ['b'])] });
  const aLease = controller.claimNode('a', 'wa', 1_000, 60_000);
  controller.verifyNode('a', aLease.id, 'rev-a', [pass('a:accept', 'rev-a')], 1_001);
  const bLease = controller.claimNode('b', 'wb', 1_001, 60_000);
  controller.verifyNode('b', bLease.id, 'rev-b', [pass('b:accept', 'rev-b')], 1_002);
  controller.claimNode('c', 'wc', 1_002, 60_000);
  controller.invalidateNode('a', 'requirement changed');
  assert.equal(controller.getNode('a').status, 'stale');
  assert.equal(controller.getNode('b').status, 'stale');
  assert.equal(controller.getNode('c').status, 'stale');
  assert.equal(controller.getNode('c').lease, undefined);
});

test('failed work stays failed and does not unlock dependents', () => {
  const controller = RunController.create({ projectId: 'p', runId: 'r', sourceRevision: 'abc', nodes: [node('a'), node('b', ['a'])] });
  const lease = controller.claimNode('a', 'worker', 1_000, 60_000);
  controller.failNode('a', lease.id, 'build failed', 1_001);
  assert.equal(controller.getNode('a').status, 'failed');
  assert.equal(controller.getNode('a').lastFailure, 'build failed');
  assert.equal(controller.getNode('b').status, 'blocked');
});
