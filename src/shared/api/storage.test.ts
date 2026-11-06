import { describe, expect, it } from 'vitest';

import { ApiError } from './errors';
import { WORKSPACE_VERSION } from './schema';
import { createSeedWorkspace } from './seed';
import { loadWorkspace, migrate, STORAGE_KEY, type KeyValueStore } from './storage';

function memoryStore(initial?: string): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(STORAGE_KEY, initial);
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

const v1 = {
  version: 1,
  sprint: { name: 'Sprint 1', workingDays: 10 },
  members: [{ id: 'a', name: 'Ada Example', skill: 'backend', hoursPerDay: 8, focusFactor: 0.8, ptoDays: 1 }],
  items: [],
};

describe('loadWorkspace', () => {
  it('seeds and persists on first use', () => {
    const store = memoryStore();
    const ws = loadWorkspace(store, createSeedWorkspace);
    expect(ws.members.length).toBeGreaterThan(0);
    expect(JSON.parse(store.data.get(STORAGE_KEY) ?? '{}')).toEqual(ws);
  });

  it('migrates v1 data and saves the upgraded shape', () => {
    const store = memoryStore(JSON.stringify(v1));
    const ws = loadWorkspace(store, createSeedWorkspace);
    expect(ws.version).toBe(WORKSPACE_VERSION);
    expect(ws.members[0]?.onCallDays).toBe(0);
    expect(JSON.parse(store.data.get(STORAGE_KEY) ?? '{}').version).toBe(WORKSPACE_VERSION);
  });

  it('keeps existing values when a migration adds a field', () => {
    const withValue = { ...v1, members: [{ ...v1.members[0], onCallDays: 3 }] };
    expect(migrate(withValue).members[0]?.onCallDays).toBe(3);
  });

  it('does not rewrite data that is already current', () => {
    const current = JSON.stringify(createSeedWorkspace());
    const store = memoryStore(current);
    loadWorkspace(store, createSeedWorkspace);
    expect(store.data.get(STORAGE_KEY)).toBe(current);
  });

  it.each([
    ['invalid JSON', '{not json'],
    ['a non-object', '[]'],
    ['a missing version', JSON.stringify({ sprint: {} })],
    ['a future version', JSON.stringify({ ...createSeedWorkspace(), version: 99 })],
    ['an unknown old version', JSON.stringify({ version: 0 })],
    ['a schema violation', JSON.stringify({ ...createSeedWorkspace(), members: [{ id: 'x' }] })],
    ['a migration that drops the version', JSON.stringify({ ...v1, members: 'nope', version: 1 })],
  ])('rejects %s as corrupt storage', (_, raw) => {
    expect(() => loadWorkspace(memoryStore(raw), createSeedWorkspace)).toThrow(ApiError);
    try {
      loadWorkspace(memoryStore(raw), createSeedWorkspace);
    } catch (e) {
      expect((e as ApiError).code).toBe('corrupt_storage');
    }
  });
});
