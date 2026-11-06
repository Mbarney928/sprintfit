import { memberCapacity } from '@/entities/member';
import { SKILL_NOUN } from '@/entities/work-item';
import {
  PRIORITIES,
  SKILLS,
  type Member,
  type Priority,
  type Skill,
  type WorkItem,
  type Workspace,
} from '@/shared/api';

export type SpillReason = 'no-capacity' | 'no-skill' | 'blocked' | 'cycle';

export interface MemberLoad {
  member: Member;
  capacityHours: number;
  plannedHours: number;
  /** plannedHours / capacityHours, or 0 when the member has no capacity. */
  utilization: number;
  itemIds: string[];
}

export interface PlannedItem {
  item: WorkItem;
  memberId: string;
  /** The item's own priority, raised to that of the most urgent item waiting on it. */
  effectivePriority: Priority;
}

export interface SpilledItem {
  item: WorkItem;
  reason: SpillReason;
  detail: string;
}

export interface SkillSummary {
  skill: Skill;
  capacityHours: number;
  demandHours: number;
  plannedHours: number;
}

export type WarningKind = 'overloaded' | 'skill-gap' | 'unavailable' | 'critical-spill';

export interface PlanWarning {
  kind: WarningKind;
  message: string;
}

export interface SprintPlan {
  loads: MemberLoad[];
  planned: PlannedItem[];
  spilled: SpilledItem[];
  skills: SkillSummary[];
  warnings: PlanWarning[];
  capacityHours: number;
  plannedHours: number;
  demandHours: number;
  utilization: number;
}

/** Members at or above this utilization have no slack for unplanned work. */
export const OVERLOAD_THRESHOLD = 0.9;

const rank = (p: Priority) => PRIORITIES.indexOf(p);
const fmt = (h: number) => `${Number.isInteger(h) ? h : h.toFixed(1)}h`;

/**
 * Builds a sprint plan:
 * 1. Computes each member's capacity (PTO, on-call, focus factor).
 * 2. Finds dependency cycles and references to missing items.
 * 3. Gives each item an effective priority: a blocker inherits the urgency of the most
 *    critical item that depends on it, so it is scheduled first (no priority inversion).
 * 4. Walks a priority-aware topological order (ties keep backlog order) and assigns each
 *    item to the same-skill member with the most remaining capacity, which balances load.
 * 5. Explains every item that does not fit and raises team-level warnings.
 */
export function planSprint({
  sprint,
  members,
  items,
}: Pick<Workspace, 'sprint' | 'members' | 'items'>): SprintPlan {
  const byId = new Map(items.map((i) => [i.id, i]));
  const order = new Map(items.map((i, index) => [i.id, index]));

  const loads = members.map<MemberLoad>((member) => ({
    member,
    capacityHours: memberCapacity(member, sprint),
    plannedHours: 0,
    utilization: 0,
    itemIds: [],
  }));

  const spilled: SpilledItem[] = [];
  const spilledIds = new Set<string>();
  const spill = (item: WorkItem, reason: SpillReason, detail: string) => {
    spilled.push({ item, reason, detail });
    spilledIds.add(item.id);
  };

  // Dependency graph restricted to items that exist.
  const dependents = new Map<string, string[]>(items.map((i) => [i.id, []]));
  for (const item of items) {
    for (const dep of item.dependsOn) dependents.get(dep)?.push(item.id);
  }

  // Kahn's algorithm: whatever cannot be ordered is in, or downstream of, a cycle.
  const inDegree = new Map(items.map((i) => [i.id, i.dependsOn.filter((d) => byId.has(d)).length]));
  const queue = items.filter((i) => inDegree.get(i.id) === 0).map((i) => i.id);
  const acyclic = new Set<string>();
  while (queue.length > 0) {
    const id = queue.shift() as string;
    acyclic.add(id);
    for (const next of dependents.get(id) ?? []) {
      const d = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, d);
      if (d === 0) queue.push(next);
    }
  }
  const inCycle = (start: string): boolean => {
    const seen = new Set<string>();
    const stack = [...(byId.get(start)?.dependsOn ?? [])];
    while (stack.length > 0) {
      const id = stack.pop() as string;
      if (id === start) return true;
      if (seen.has(id) || acyclic.has(id) || !byId.has(id)) continue;
      seen.add(id);
      stack.push(...(byId.get(id)?.dependsOn ?? []));
    }
    return false;
  };
  for (const item of items) {
    if (acyclic.has(item.id)) continue;
    if (inCycle(item.id)) spill(item, 'cycle', 'Part of a dependency cycle; break the loop to plan it.');
  }

  // Effective priority: the most urgent rank among the item and everything downstream of it.
  const effective = new Map<string, number>();
  const effectiveRank = (id: string, visiting = new Set<string>()): number => {
    const cached = effective.get(id);
    if (cached !== undefined) return cached;
    const item = byId.get(id);
    if (!item) return PRIORITIES.length;
    visiting.add(id);
    let best = rank(item.priority);
    for (const dep of dependents.get(id) ?? []) {
      if (acyclic.has(dep) && !visiting.has(dep)) best = Math.min(best, effectiveRank(dep, visiting));
    }
    visiting.delete(id);
    effective.set(id, best);
    return best;
  };

  // Priority-aware topological order over the acyclic items.
  const remainingDeps = new Map(
    items
      .filter((i) => acyclic.has(i.id))
      .map((i) => [i.id, i.dependsOn.filter((d) => acyclic.has(d)).length]),
  );
  const ready = [...remainingDeps].filter(([, n]) => n === 0).map(([id]) => id);
  const ordered: string[] = [];
  const byUrgency = (a: string, b: string) =>
    effectiveRank(a) - effectiveRank(b) || (order.get(a) ?? 0) - (order.get(b) ?? 0);
  while (ready.length > 0) {
    ready.sort(byUrgency);
    const id = ready.shift() as string;
    ordered.push(id);
    for (const next of dependents.get(id) ?? []) {
      if (!remainingDeps.has(next)) continue;
      const n = (remainingDeps.get(next) ?? 0) - 1;
      remainingDeps.set(next, n);
      if (n === 0) ready.push(next);
    }
  }
  // Items downstream of a cycle never become ready; they are blocked by it.
  for (const item of items) {
    if (!acyclic.has(item.id) && !spilledIds.has(item.id)) {
      spill(item, 'blocked', 'Waits on an item caught in a dependency cycle.');
    }
  }

  const planned: PlannedItem[] = [];
  for (const id of ordered) {
    const item = byId.get(id) as WorkItem;
    const missing = item.dependsOn.find((d) => !byId.has(d));
    if (missing !== undefined) {
      spill(item, 'blocked', 'Depends on an item that no longer exists.');
      continue;
    }
    const blocker = item.dependsOn.map((d) => byId.get(d) as WorkItem).find((d) => spilledIds.has(d.id));
    if (blocker) {
      spill(item, 'blocked', `Waits on “${blocker.title}”, which is not in this sprint.`);
      continue;
    }
    const candidates = loads.filter((l) => l.member.skill === item.skill && l.capacityHours > 0);
    if (candidates.length === 0) {
      spill(item, 'no-skill', `Nobody with ${SKILL_NOUN[item.skill]} skills has capacity this sprint.`);
      continue;
    }
    const best = candidates.reduce((a, b) =>
      b.capacityHours - b.plannedHours > a.capacityHours - a.plannedHours ? b : a,
    );
    const free = best.capacityHours - best.plannedHours;
    if (free < item.estimateHours) {
      spill(
        item,
        'no-capacity',
        free > 0
          ? `Needs ${fmt(item.estimateHours)} of ${SKILL_NOUN[item.skill]} work; the most anyone has left is ${fmt(free)}. Consider splitting it.`
          : `Needs ${fmt(item.estimateHours)} of ${SKILL_NOUN[item.skill]} work; all ${SKILL_NOUN[item.skill]} capacity is committed.`,
      );
      continue;
    }
    best.plannedHours += item.estimateHours;
    best.itemIds.push(item.id);
    planned.push({
      item,
      memberId: best.member.id,
      effectivePriority: PRIORITIES[effectiveRank(id)] ?? item.priority,
    });
  }

  for (const load of loads) {
    load.utilization = load.capacityHours > 0 ? load.plannedHours / load.capacityHours : 0;
  }

  const skills = SKILLS.map<SkillSummary>((skill) => ({
    skill,
    capacityHours: sum(loads.filter((l) => l.member.skill === skill).map((l) => l.capacityHours)),
    demandHours: sum(items.filter((i) => i.skill === skill).map((i) => i.estimateHours)),
    plannedHours: sum(planned.filter((p) => p.item.skill === skill).map((p) => p.item.estimateHours)),
  })).filter((s) => s.capacityHours > 0 || s.demandHours > 0);

  const warnings: PlanWarning[] = [];
  for (const s of skills) {
    if (s.demandHours > s.capacityHours) {
      warnings.push({
        kind: 'skill-gap',
        message: `${capitalize(SKILL_NOUN[s.skill])} work needs ${fmt(s.demandHours)} but the team has ${fmt(s.capacityHours)}.`,
      });
    }
  }
  for (const l of loads) {
    if (l.capacityHours === 0) {
      warnings.push({ kind: 'unavailable', message: `${l.member.name} has no capacity this sprint.` });
    } else if (l.utilization >= OVERLOAD_THRESHOLD) {
      warnings.push({
        kind: 'overloaded',
        message: `${l.member.name} is at ${Math.round(l.utilization * 100)}% with no slack for interruptions.`,
      });
    }
  }
  const criticalSpills = spilled.filter((s) => s.item.priority === 'critical').length;
  if (criticalSpills > 0) {
    warnings.unshift({
      kind: 'critical-spill',
      message: `${criticalSpills} critical item${criticalSpills === 1 ? '' : 's'} could not be planned.`,
    });
  }

  spilled.sort(
    (a, b) =>
      rank(a.item.priority) - rank(b.item.priority) ||
      (order.get(a.item.id) ?? 0) - (order.get(b.item.id) ?? 0),
  );
  const capacityHours = sum(loads.map((l) => l.capacityHours));
  const plannedHours = sum(planned.map((p) => p.item.estimateHours));
  return {
    loads,
    planned,
    spilled,
    skills,
    warnings,
    capacityHours,
    plannedHours,
    demandHours: sum(items.map((i) => i.estimateHours)),
    utilization: capacityHours > 0 ? plannedHours / capacityHours : 0,
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
