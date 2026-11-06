import { beforeEach, describe, expect, it } from 'vitest';

import { createLocalApi, type SprintApi } from './client';
import { ApiError } from './errors';
import type { MemberInput, WorkItemInput } from './schema';

const member: MemberInput = {
  name: 'Sam Example',
  skill: 'qa',
  hoursPerDay: 6,
  focusFactor: 0.8,
  ptoDays: 0,
  onCallDays: 0,
};
const item: WorkItemInput = {
  title: 'Write release notes',
  estimateHours: 4,
  priority: 'low',
  skill: 'qa',
  dependsOn: [],
};

async function expectApiError(p: Promise<unknown>, code: string, field?: string) {
  const error = await p.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(ApiError);
  expect((error as ApiError).code).toBe(code);
  if (field) expect((error as ApiError).fieldErrors[field]).toBeTruthy();
}

describe('createLocalApi', () => {
  let api: SprintApi;
  let n = 0;
  beforeEach(() => {
    n = 0;
    api = createLocalApi({ store: window.localStorage, newId: () => `id-${++n}` });
  });

  it('creates, updates and deletes members', async () => {
    const created = await api.saveMember(member);
    expect(created.id).toBe('id-1');
    const updated = await api.saveMember({ ...member, ptoDays: 2 }, created.id);
    expect(updated.ptoDays).toBe(2);
    await api.deleteMember(created.id);
    expect((await api.getWorkspace()).members.some((m) => m.id === created.id)).toBe(false);
  });

  it('validates member input with field-level errors', async () => {
    await expectApiError(api.saveMember({ ...member, name: ' ', focusFactor: 2 }), 'validation', 'name');
    await expectApiError(api.saveMember(member, 'missing'), 'not_found');
  });

  it('creates items, de-duplicates dependencies and rejects bad ones', async () => {
    const a = await api.saveItem(item);
    const b = await api.saveItem({ ...item, title: 'Publish notes', dependsOn: [a.id, a.id] });
    expect(b.dependsOn).toEqual([a.id]);
    await expectApiError(api.saveItem({ ...item, dependsOn: ['nope'] }), 'validation', 'dependsOn');
    await expectApiError(api.saveItem({ ...item, dependsOn: [b.id] }, b.id), 'validation', 'dependsOn');
    await expectApiError(api.saveItem({ ...item, title: 'x' }), 'validation', 'title');
    await expectApiError(api.saveItem(item, 'missing'), 'not_found');
    const renamed = await api.saveItem({ ...item, title: 'Renamed' }, a.id);
    expect(renamed.title).toBe('Renamed');
  });

  it('removes a deleted item from other items’ dependencies', async () => {
    const a = await api.saveItem(item);
    const b = await api.saveItem({ ...item, title: 'Depends on A', dependsOn: [a.id] });
    await api.deleteItem(a.id);
    const ws = await api.getWorkspace();
    expect(ws.items.find((i) => i.id === b.id)?.dependsOn).toEqual([]);
  });

  it('updates the sprint and resets demo data', async () => {
    await expect(api.updateSprint({ name: 'Sprint 25', workingDays: 8 })).resolves.toEqual({
      name: 'Sprint 25',
      workingDays: 8,
    });
    await expectApiError(api.updateSprint({ name: 'S', workingDays: 0 }), 'validation', 'workingDays');
    await api.saveMember(member);
    const reset = await api.resetDemo();
    expect(reset.sprint.name).toContain('Sprint 24');
    expect(reset.members.some((m) => m.name === member.name)).toBe(false);
  });

  it('serializes concurrent writes so none are lost', async () => {
    await Promise.all([
      api.saveMember({ ...member, name: 'One Person' }),
      api.saveMember({ ...member, name: 'Two Person' }),
    ]);
    const names = (await api.getWorkspace()).members.map((m) => m.name);
    expect(names).toEqual(expect.arrayContaining(['One Person', 'Two Person']));
  });

  it('keeps working after a failed call', async () => {
    await expectApiError(api.saveMember({ ...member, name: '' }), 'validation');
    await expect(api.getWorkspace()).resolves.toBeTruthy();
  });

  it('honours artificial latency and default ids', async () => {
    const slow = createLocalApi({ store: window.localStorage, latencyMs: 5 });
    const created = await slow.saveMember(member);
    expect(created.id).toMatch(/[0-9a-f-]{36}/);
  });
});
