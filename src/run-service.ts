import {
  RunController,
  type CreateRunInput,
  type ExecutionLease,
  type NodeRecord,
  type RunSnapshot
} from './controller.js';

export interface RunStore {
  load(runId: string): Promise<RunSnapshot | undefined>;
  save(snapshot: RunSnapshot): Promise<void>;
}

export class RunService {
  private tail: Promise<void> = Promise.resolve();

  constructor(private readonly store: RunStore) {}

  createRun(input: CreateRunInput): Promise<RunSnapshot> {
    return this.exclusive(async () => {
      if (await this.store.load(input.runId)) throw new Error(`Run ${input.runId} already exists.`);
      const controller = RunController.create(input);
      const snapshot = controller.snapshot();
      await this.store.save(snapshot);
      return snapshot;
    });
  }

  getRun(runId: string): Promise<RunSnapshot> {
    return this.exclusive(async () => (await this.requireRun(runId)).snapshot());
  }

  claimNode(runId: string, nodeId: string, workerId: string, ttlMs: number, now = Date.now()): Promise<ExecutionLease> {
    return this.exclusive(async () => {
      const controller = await this.requireRun(runId);
      const lease = controller.claimNode(nodeId, workerId, now, ttlMs);
      await this.store.save(controller.snapshot());
      return lease;
    });
  }

  failNode(runId: string, nodeId: string, leaseId: string, reason: string, now = Date.now()): Promise<NodeRecord> {
    return this.exclusive(async () => {
      const controller = await this.requireRun(runId);
      controller.failNode(nodeId, leaseId, reason, now);
      await this.store.save(controller.snapshot());
      return controller.getNode(nodeId);
    });
  }

  invalidateNode(runId: string, nodeId: string, reason: string): Promise<RunSnapshot> {
    return this.exclusive(async () => {
      const controller = await this.requireRun(runId);
      controller.invalidateNode(nodeId, reason);
      const snapshot = controller.snapshot();
      await this.store.save(snapshot);
      return snapshot;
    });
  }

  private async requireRun(runId: string): Promise<RunController> {
    const snapshot = await this.store.load(runId);
    if (!snapshot) throw new Error(`Run ${runId} does not exist.`);
    return RunController.restore(snapshot);
  }

  private async exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.tail;
    let release!: () => void;
    this.tail = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}
