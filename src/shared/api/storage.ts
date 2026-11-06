import { ApiError } from './errors';
import { WORKSPACE_VERSION, WorkspaceSchema, type Workspace } from './schema';

export const STORAGE_KEY = 'sprintfit:workspace';

/** The subset of the Web Storage API the persistence layer needs (easy to fake in tests). */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

type Data = Record<string, unknown>;
type Migration = (data: Data) => Data;

const isRecord = (v: unknown): v is Data => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Schema migrations, keyed by the version they upgrade FROM. Each one moves stored data
 * forward a single version, so a browser that skipped releases is upgraded step by step.
 */
export const migrations: Readonly<Record<number, Migration>> = {
  // v1 -> v2: members gained `onCallDays`, which earlier data did not record.
  1: (data) => ({
    ...data,
    version: 2,
    members: Array.isArray(data['members'])
      ? data['members'].map((m: unknown) => (isRecord(m) ? { onCallDays: 0, ...m } : m))
      : data['members'],
  }),
};

const corrupt = () =>
  new ApiError('corrupt_storage', 'Saved data could not be read. Reset the demo data to continue.');

/** Upgrades any supported stored shape to the current Workspace, validating the result. */
export function migrate(raw: unknown): Workspace {
  if (!isRecord(raw) || typeof raw['version'] !== 'number') throw corrupt();
  let data: Data = raw;
  let version = raw['version'];
  if (version > WORKSPACE_VERSION) throw corrupt();
  while (version < WORKSPACE_VERSION) {
    const step = migrations[version];
    if (!step) throw corrupt();
    data = step(data);
    version = typeof data['version'] === 'number' ? data['version'] : NaN;
  }
  const parsed = WorkspaceSchema.safeParse(data);
  if (!parsed.success) throw corrupt();
  return parsed.data;
}

/** Reads the workspace, seeding on first use and persisting any migration that ran. */
export function loadWorkspace(store: KeyValueStore, seed: () => Workspace): Workspace {
  const raw = store.getItem(STORAGE_KEY);
  if (raw === null) {
    const fresh = seed();
    saveWorkspace(store, fresh);
    return fresh;
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw corrupt();
  }
  const workspace = migrate(json);
  if (isRecord(json) && json['version'] !== WORKSPACE_VERSION) saveWorkspace(store, workspace);
  return workspace;
}

export function saveWorkspace(store: KeyValueStore, workspace: Workspace): void {
  store.setItem(STORAGE_KEY, JSON.stringify(workspace));
}
