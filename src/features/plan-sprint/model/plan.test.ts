import { describe, expect, it } from 'vitest';

import { createSeedWorkspace, type Member, type WorkItem } from '@/shared/api';

import { planSprint } from './plan';

const sprint = { name: 'Test sprint', workingDays: 10 };

function member(id: string, skill: Member['skill'], hours = 50, extra: Partial<Member> = {}): Member {
  // 10 days × 5h × 1.0 focus = 50h by default; `hours` scales hoursPerDay.
  return { id, name: `Person ${id}`, skill, hoursPerDay: hours / 10, focusFactor: 1, ptoDays: 0, onCallDays: 0, ...extra };
}

function item(id: string, estimateHours: number, extra: Partial<WorkItem> = {}): WorkItem {
  return { id, title: `Item ${id}`, estimateHours, priority: 'medium', skill: 'backend', dependsOn: [], ...extra };
}

const plannedIds = (p: ReturnType<typeof planSprint>) => p.planned.map((x) => x.item.id);
const spillOf = (p: ReturnType<typeof planSprint>, id: string) => p.spilled.find((s) => s.item.id === id);

describe('planSprint', () => {
  it('plans in priority order and keeps backlog order for ties', () => {
    const plan = planSprint({
      sprint,
      members: [member('a', 'backend', 30)],
      items: [item('low', 10, { priority: 'low' }), item('m1', 10), item('crit', 10, { priority: 'critical' }), item('m2', 10)],
    });
    expect(plannedIds(plan)).toEqual(['crit', 'm1', 'm2']);
    expect(spillOf(plan, 'low')?.reason).toBe('no-capacity');
    expect(spillOf(plan, 'low')?.detail).toContain('all backend capacity is committed');
  });

  it('lets a blocker inherit the priority of what waits on it', () => {
    const plan = planSprint({
      sprint,
      members: [member('a', 'backend', 20)],
      items: [
        item('high', 10, { priority: 'high' }),
        item('blocker', 10, { priority: 'low' }),
        item('crit', 10, { priority: 'critical', dependsOn: ['blocker'] }),
      ],
    });
    // Without inheritance "high" would take the capacity and "crit" would be blocked.
    expect(plannedIds(plan)).toEqual(['blocker', 'crit']);
    expect(plan.planned[0]?.effectivePriority).toBe('critical');
    expect(spillOf(plan, 'high')?.reason).toBe('no-capacity');
  });

  it('blocks dependents of anything that did not fit', () => {
    const plan = planSprint({
      sprint,
      members: [member('a', 'backend', 10)],
      items: [item('big', 20, { priority: 'critical' }), item('child', 5, { dependsOn: ['big'] })],
    });
    expect(spillOf(plan, 'big')?.reason).toBe('no-capacity');
    expect(spillOf(plan, 'child')?.reason).toBe('blocked');
    expect(spillOf(plan, 'child')?.detail).toContain('Item big');
    expect(plan.warnings[0]?.kind).toBe('critical-spill');
  });

  it('suggests splitting when capacity is fragmented', () => {
    const plan = planSprint({
      sprint,
      members: [member('a', 'backend', 15), member('b', 'backend', 15)],
      items: [item('x', 20)],
    });
    expect(spillOf(plan, 'x')?.detail).toMatch(/most anyone has left is 15h\. Consider splitting/);
  });

  it('detects dependency cycles and blocks what depends on them', () => {
    const plan = planSprint({
      sprint,
      members: [member('a', 'backend', 50)],
      items: [
        item('a1', 5, { dependsOn: ['a2'] }),
        item('a2', 5, { dependsOn: ['a1'] }),
        item('self', 5, { dependsOn: ['self'] }),
        item('down', 5, { dependsOn: ['a1'] }),
        item('free', 5),
      ],
    });
    expect(spillOf(plan, 'a1')?.reason).toBe('cycle');
    expect(spillOf(plan, 'a2')?.reason).toBe('cycle');
    expect(spillOf(plan, 'self')?.reason).toBe('cycle');
    expect(spillOf(plan, 'down')?.reason).toBe('blocked');
    expect(plannedIds(plan)).toEqual(['free']);
  });

  it('blocks items that depend on a missing item', () => {
    const plan = planSprint({ sprint, members: [member('a', 'backend')], items: [item('x', 5, { dependsOn: ['gone'] })] });
    expect(spillOf(plan, 'x')).toMatchObject({ reason: 'blocked', detail: expect.stringContaining('no longer exists') });
  });

  it('reports work nobody has the skill (or time) for', () => {
    const plan = planSprint({
      sprint,
      members: [member('a', 'backend'), member('q', 'qa', 50, { ptoDays: 10 })],
      items: [item('design', 5, { skill: 'design' }), item('qa', 5, { skill: 'qa' })],
    });
    expect(spillOf(plan, 'design')?.reason).toBe('no-skill');
    expect(spillOf(plan, 'qa')?.reason).toBe('no-skill');
    expect(plan.warnings.map((w) => w.kind)).toEqual(expect.arrayContaining(['skill-gap', 'unavailable']));
  });

  it('balances load across same-skill members', () => {
    const plan = planSprint({
      sprint,
      members: [member('a', 'frontend', 30), member('b', 'frontend', 30)],
      items: [item('1', 10, { skill: 'frontend' }), item('2', 10, { skill: 'frontend' }), item('3', 10, { skill: 'frontend' })],
    });
    const hours = plan.loads.map((l) => l.plannedHours).sort();
    expect(hours).toEqual([10, 20]);
  });

  it('computes totals, utilization and overload warnings', () => {
    const plan = planSprint({
      sprint,
      members: [member('a', 'backend', 20), member('idle', 'backend', 0, { ptoDays: 10 })],
      items: [item('1', 19)],
    });
    expect(plan.capacityHours).toBe(20);
    expect(plan.plannedHours).toBe(19);
    expect(plan.demandHours).toBe(19);
    expect(plan.utilization).toBeCloseTo(0.95);
    expect(plan.loads.find((l) => l.member.id === 'idle')?.utilization).toBe(0);
    expect(plan.warnings.map((w) => w.kind)).toEqual(['overloaded', 'unavailable']);
  });

  it('handles an empty workspace', () => {
    const plan = planSprint({ sprint, members: [], items: [] });
    expect(plan).toMatchObject({ planned: [], spilled: [], skills: [], warnings: [], utilization: 0, capacityHours: 0 });
  });

  it('produces the documented story for the demo data', () => {
    const plan = planSprint(createSeedWorkspace());
    const byReason = (r: string) => plan.spilled.filter((s) => s.reason === r).map((s) => s.item.id);

    // The low-priority API contract is pulled forward because the critical card form needs it.
    expect(plan.planned.find((p) => p.item.id === 'w-contract')?.effectivePriority).toBe('critical');
    expect(byReason('no-capacity')).toEqual(expect.arrayContaining(['w-promo-service', 'w-saved-cards', 'w-a11y-audit']));
    expect(byReason('blocked')).toEqual(['w-promo-field']);
    expect(plan.warnings.map((w) => w.kind)).toEqual(expect.arrayContaining(['skill-gap', 'unavailable']));
    expect(plan.warnings.some((w) => w.kind === 'critical-spill')).toBe(false);
    expect(plan.spilled.map((s) => s.item.priority)).toEqual([...plan.spilled.map((s) => s.item.priority)].sort((a, b) =>
      ['critical', 'high', 'medium', 'low'].indexOf(a) - ['critical', 'high', 'medium', 'low'].indexOf(b)));
  });
});
