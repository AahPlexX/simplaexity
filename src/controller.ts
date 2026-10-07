import { randomUUID } from 'node:crypto';

export type NodeKind = 'planning' | 'implementation' | 'verification' | 'delivery';
export type NodeStatus = 'blocked' | 'ready' | 'running' | 'verified' | 'failed' | 'stale';
export type EvidenceOutcome = 'passed' | 'failed';

export interface NodeDefinition {
  id: string;
  kind: NodeKind;
  dependsOn: string[];
  acceptanceChecks: string[];
}

export interface EvidenceReceipt {
  checkId: string;
  outcome: EvidenceOutcome;
  candidateRevision: string;
  observedAt: string;
}

export interface ExecutionLease {
  id: string;
  nodeId: string;
  workerId: string;
  attempt: number;
  issuedAt: number;
  expiresAt: number;
}

export interface NodeRecord extends NodeDefinition {
  status: NodeStatus;
  attempt: number;
  lease?: ExecutionLease;
  verifiedRevision?: string;
  evidence?: EvidenceReceipt[];
  lastFailure?: string;
  invalidationReason?: string;
}

export interface RunSnapshot {
  schemaVersion: 1;
  projectId: string;
  runId: string;
  sourceRevision: string;
  createdAt: string;
  updatedAt: string;
  nodes: NodeRecord[];
}

export interface CreateRunInput {
  projectId: string;
  runId: string;
  sourceRevision: string;
  nodes: NodeDefinition[];
  now?: string;
}

export type ControllerErrorCode = 'INVALID_GRAPH' | 'UNKNOWN_NODE' | 'INVALID_TRANSITION' | 'STALE_LEASE' | 'INVALID_EVIDENCE';

export class ControllerError extends Error {
  readonly code: ControllerErrorCode;

  constructor(code: ControllerErrorCode, message: string) {
    super(message);
    this.name = 'ControllerError';
    this.code = code;
  }
}

export class RunController {
  private readonly state: RunSnapshot;

  private constructor(state: RunSnapshot) {
    this.state = state;
  }

  static create(input: CreateRunInput): RunController {
    validateGraph(input.nodes);
    const now = input.now ?? new Date().toISOString();
    const nodes = input.nodes.map<NodeRecord>((definition) => ({
      ...copyDefinition(definition),
      status: definition.dependsOn.length === 0 ? 'ready' : 'blocked',
      attempt: 0
    }));

    return new RunController({
      schemaVersion: 1,
      projectId: input.projectId,
      runId: input.runId,
      sourceRevision: input.sourceRevision,
      createdAt: now,
      updatedAt: now,
      nodes
    });
  }

  static restore(snapshot: RunSnapshot): RunController {
    validateGraph(snapshot.nodes);
    return new RunController(cloneSnapshot(snapshot));
  }

  snapshot(): RunSnapshot {
    return cloneSnapshot(this.state);
  }

  getNode(nodeId: string): NodeRecord {
    return cloneNode(this.requireNode(nodeId));
  }

  listReadyNodes(): NodeRecord[] {
    return this.state.nodes.filter((node) => node.status === 'ready').map(cloneNode);
  }

  claimNode(nodeId: string, workerId: string, now: number, ttlMs: number): ExecutionLease {
    if (!workerId.trim()) throw new ControllerError('INVALID_TRANSITION', 'Worker id is required.');
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new ControllerError('INVALID_TRANSITION', 'Lease TTL must be greater than zero.');

    const node = this.requireNode(nodeId);
    const reclaimingExpiredLease = node.status === 'running' && node.lease !== undefined && node.lease.expiresAt <= now;
    if (node.status !== 'ready' && !reclaimingExpiredLease) {
      throw new ControllerError('INVALID_TRANSITION', `Node ${nodeId} is not ready to be claimed.`);
    }

    const attempt = node.attempt + 1;
    const lease: ExecutionLease = {
      id: randomUUID(),
      nodeId,
      workerId,
      attempt,
      issuedAt: now,
      expiresAt: now + ttlMs
    };
    node.status = 'running';
    node.attempt = attempt;
    node.lease = lease;
    delete node.lastFailure;
    this.touch(now);
    return { ...lease };
  }

  verifyNode(nodeId: string, leaseId: string, candidateRevision: string, evidence: EvidenceReceipt[]): void {
    const node = this.requireCurrentLease(nodeId, leaseId);
    validateEvidence(node, candidateRevision, evidence);
    node.status = 'verified';
    node.verifiedRevision = candidateRevision;
    node.evidence = evidence.map((receipt) => ({ ...receipt }));
    delete node.lease;
    delete node.lastFailure;
    delete node.invalidationReason;
    this.recomputeReadiness();
    this.touch();
  }

  failNode(nodeId: string, leaseId: string, reason: string): void {
    const node = this.requireCurrentLease(nodeId, leaseId);
    if (!reason.trim()) throw new ControllerError('INVALID_TRANSITION', 'Failure reason is required.');
    node.status = 'failed';
    node.lastFailure = reason;
    delete node.lease;
    this.recomputeReadiness();
    this.touch();
  }

  invalidateNode(nodeId: string, reason: string): void {
    if (!reason.trim()) throw new ControllerError('INVALID_TRANSITION', 'Invalidation reason is required.');
    this.requireNode(nodeId);
    const affected = new Set<string>([nodeId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of this.state.nodes) {
        if (!affected.has(node.id) && node.dependsOn.some((dependency) => affected.has(dependency))) {
          affected.add(node.id);
          changed = true;
        }
      }
    }

    for (const node of this.state.nodes) {
      if (!affected.has(node.id)) continue;
      node.status = 'stale';
      node.invalidationReason = reason;
      delete node.lease;
      delete node.verifiedRevision;
      delete node.evidence;
    }
    this.touch();
  }

  private requireNode(nodeId: string): NodeRecord {
    const node = this.state.nodes.find((candidate) => candidate.id === nodeId);
    if (!node) throw new ControllerError('UNKNOWN_NODE', `Unknown node ${nodeId}.`);
    return node;
  }

  private requireCurrentLease(nodeId: string, leaseId: string): NodeRecord {
    const node = this.requireNode(nodeId);
    if (node.status !== 'running' || node.lease?.id !== leaseId) {
      throw new ControllerError('STALE_LEASE', `Lease ${leaseId} is not current for node ${nodeId}.`);
    }
    return node;
  }

  private recomputeReadiness(): void {
    for (const node of this.state.nodes) {
      if (node.status === 'verified' || node.status === 'running' || node.status === 'failed' || node.status === 'stale') continue;
      node.status = node.dependsOn.every((dependencyId) => this.requireNode(dependencyId).status === 'verified') ? 'ready' : 'blocked';
    }
  }

  private touch(now = Date.now()): void {
    this.state.updatedAt = new Date(now).toISOString();
  }
}

function validateGraph(nodes: readonly NodeDefinition[]): void {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (!node.id.trim()) throw invalidGraph('Node id is required.');
    if (ids.has(node.id)) throw invalidGraph(`Duplicate node id ${node.id}.`);
    if (node.acceptanceChecks.length === 0) throw invalidGraph(`Node ${node.id} has no acceptance checks.`);
    if (new Set(node.acceptanceChecks).size !== node.acceptanceChecks.length) throw invalidGraph(`Node ${node.id} has duplicate acceptance checks.`);
    ids.add(node.id);
  }

  for (const node of nodes) {
    for (const dependency of node.dependsOn) {
      if (!ids.has(dependency)) throw invalidGraph(`Node ${node.id} depends on missing node ${dependency}.`);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visit = (nodeId: string): void => {
    if (visiting.has(nodeId)) throw invalidGraph(`Dependency cycle includes ${nodeId}.`);
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    for (const dependency of byId.get(nodeId)?.dependsOn ?? []) visit(dependency);
    visiting.delete(nodeId);
    visited.add(nodeId);
  };
  for (const node of nodes) visit(node.id);
}

function validateEvidence(node: NodeRecord, candidateRevision: string, evidence: readonly EvidenceReceipt[]): void {
  if (!candidateRevision.trim()) throw new ControllerError('INVALID_EVIDENCE', 'Candidate revision is required.');
  if (evidence.length !== node.acceptanceChecks.length) throw new ControllerError('INVALID_EVIDENCE', `Evidence for ${node.id} does not cover every required check.`);

  const receipts = new Map(evidence.map((receipt) => [receipt.checkId, receipt]));
  if (receipts.size !== evidence.length || node.acceptanceChecks.some((checkId) => !receipts.has(checkId))) {
    throw new ControllerError('INVALID_EVIDENCE', `Evidence for ${node.id} does not exactly match required checks.`);
  }

  for (const checkId of node.acceptanceChecks) {
    const receipt = receipts.get(checkId);
    if (!receipt || receipt.outcome !== 'passed') throw new ControllerError('INVALID_EVIDENCE', `Required check ${checkId} did not pass.`);
    if (receipt.candidateRevision !== candidateRevision) throw new ControllerError('INVALID_EVIDENCE', `Required check ${checkId} is bound to a different revision.`);
  }
}

function copyDefinition(definition: NodeDefinition): NodeDefinition {
  return {
    id: definition.id,
    kind: definition.kind,
    dependsOn: [...definition.dependsOn],
    acceptanceChecks: [...definition.acceptanceChecks]
  };
}

function cloneNode(node: NodeRecord): NodeRecord {
  return {
    ...node,
    dependsOn: [...node.dependsOn],
    acceptanceChecks: [...node.acceptanceChecks],
    ...(node.lease ? { lease: { ...node.lease } } : {}),
    ...(node.evidence ? { evidence: node.evidence.map((receipt) => ({ ...receipt })) } : {})
  };
}

function cloneSnapshot(snapshot: RunSnapshot): RunSnapshot {
  return { ...snapshot, nodes: snapshot.nodes.map(cloneNode) };
}

function invalidGraph(message: string): ControllerError {
  return new ControllerError('INVALID_GRAPH', message);
}
