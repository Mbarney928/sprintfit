import type { z } from 'zod';

import { ApiError } from './errors';
import { createSeedWorkspace } from './seed';
import {
  MemberInputSchema,
  SprintSchema,
  WorkItemInputSchema,
  type Member,
  type MemberInput,
  type Sprint,
  type WorkItem,
  type WorkItemInput,
  type Workspace,
} from './schema';
import { loadWorkspace, saveWorkspace, type KeyValueStore } from './storage';

/**
 * The typed API the UI talks to. The demo implementation persists to browser storage; a
 * real backend only needs to implement this interface (see docs/adr/0002).
 */
export interface SprintApi {
  getWorkspace(): Promise<Workspace>;
  saveMember(input: MemberInput, id?: string): Promise<Member>;
  deleteMember(id: string): Promise<void>;
  saveItem(input: WorkItemInput, id?: string): Promise<WorkItem>;
  deleteItem(id: string): Promise<void>;
  updateSprint(input: Sprint): Promise<Sprint>;
  resetDemo(): Promise<Workspace>;
}

export interface LocalApiOptions {
  store: KeyValueStore;
  /** Artificial latency so loading states are visible in the demo; 0 in tests. */
  latencyMs?: number;
  newId?: () => string;
}

function parse<S extends z.ZodType>(schema: S, input: unknown): z.infer<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw ApiError.fromZod(result.error);
  return result.data;
}

export function createLocalApi({
  store,
  latencyMs = 0,
  newId = () => crypto.randomUUID(),
}: LocalApiOptions): SprintApi {
  const delay = () => new Promise<void>((resolve) => setTimeout(resolve, latencyMs));
  const read = () => loadWorkspace(store, createSeedWorkspace);
  const write = (ws: Workspace) => {
    saveWorkspace(store, ws);
  };
  /** Serializes calls so concurrent mutations cannot overwrite each other's changes. */
  let queue: Promise<unknown> = Promise.resolve();
  const run = <T>(fn: () => T): Promise<T> => {
    const next = queue.then(delay).then(fn);
    queue = next.catch(() => undefined);
    return next;
  };

  return {
    getWorkspace: () => run(read),

    saveMember: (input, id) =>
      run(() => {
        const data = parse(MemberInputSchema, input);
        const ws = read();
        if (id !== undefined) {
          const index = ws.members.findIndex((m) => m.id === id);
          if (index === -1) throw new ApiError('not_found', 'That team member no longer exists.');
          const updated: Member = { ...data, id };
          ws.members[index] = updated;
          write(ws);
          return updated;
        }
        const created: Member = { ...data, id: newId() };
        ws.members.push(created);
        write(ws);
        return created;
      }),

    deleteMember: (id) =>
      run(() => {
        const ws = read();
        ws.members = ws.members.filter((m) => m.id !== id);
        write(ws);
      }),

    saveItem: (input, id) =>
      run(() => {
        const data = parse(WorkItemInputSchema, input);
        const ws = read();
        const known = new Set(ws.items.map((i) => i.id));
        const dependsOn = [...new Set(data.dependsOn)];
        if (id !== undefined && dependsOn.includes(id)) {
          throw new ApiError('validation', 'Some fields need attention.', {
            dependsOn: 'An item cannot depend on itself',
          });
        }
        if (dependsOn.some((d) => !known.has(d))) {
          throw new ApiError('validation', 'Some fields need attention.', {
            dependsOn: 'Unknown dependency',
          });
        }
        if (id !== undefined) {
          const index = ws.items.findIndex((i) => i.id === id);
          if (index === -1) throw new ApiError('not_found', 'That work item no longer exists.');
          const updated: WorkItem = { ...data, dependsOn, id };
          ws.items[index] = updated;
          write(ws);
          return updated;
        }
        const created: WorkItem = { ...data, dependsOn, id: newId() };
        ws.items.push(created);
        write(ws);
        return created;
      }),

    deleteItem: (id) =>
      run(() => {
        const ws = read();
        ws.items = ws.items
          .filter((i) => i.id !== id)
          .map((i) => ({ ...i, dependsOn: i.dependsOn.filter((d) => d !== id) }));
        write(ws);
      }),

    updateSprint: (input) =>
      run(() => {
        const sprint = parse(SprintSchema, input);
        const ws = read();
        ws.sprint = sprint;
        write(ws);
        return sprint;
      }),

    resetDemo: () =>
      run(() => {
        const ws = createSeedWorkspace();
        write(ws);
        return ws;
      }),
  };
}
