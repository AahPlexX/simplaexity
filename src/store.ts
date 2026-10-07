import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RunSnapshot } from './controller.js';

export class FileRunStore {
  constructor(private readonly directory: string) {}

  async load(runId: string): Promise<RunSnapshot | undefined> {
    try {
      const raw = await readFile(this.pathFor(runId), 'utf8');
      return JSON.parse(raw) as RunSnapshot;
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') return undefined;
      throw error;
    }
  }

  async save(snapshot: RunSnapshot): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const target = this.pathFor(snapshot.runId);
    const temporary = `${target}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
      await rename(temporary, target);
    } catch (error) {
      await unlink(temporary).catch(() => undefined);
      throw error;
    }
  }

  private pathFor(runId: string): string {
    return join(this.directory, `${encodeURIComponent(runId)}.json`);
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
