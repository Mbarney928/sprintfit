import { PriorityBadge } from '@/entities/work-item';
import { usePlan, type PlanWarning, type SpillReason } from '@/features/plan-sprint';
import { ResetDemoButton } from '@/features/reset-demo';
import { SprintSettings } from '@/features/sprint-settings';
import { formatHours, formatPercent } from '@/shared/lib';
import { Badge, type BadgeProps, Card, EmptyState, ScrollRegion, PageHeader, StatTile } from '@/shared/ui';
import page from '@/shared/ui/styles/page.module.css';
import { CapacityChart } from '@/widgets/capacity-chart';
import { WorkspaceStatus } from '@/widgets/workspace-status';

const REASON: Record<SpillReason, { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  'no-capacity': { label: 'No capacity', tone: 'warning' },
  'no-skill': { label: 'Skill gap', tone: 'warning' },
  blocked: { label: 'Blocked', tone: 'neutral' },
  cycle: { label: 'Dependency cycle', tone: 'critical' },
};

const WARNING_ICON: Record<PlanWarning['kind'], string> = {
  'critical-spill': '⛔',
  'skill-gap': '⚠',
  overloaded: '⚠',
  unavailable: 'ℹ',
};

export function PlanPage() {
  const { data: workspace, plan, isPending, error, refetch } = usePlan();

  if (!workspace || !plan) {
    return <WorkspaceStatus isPending={isPending} error={error} onRetry={() => void refetch()} />;
  }

  const nameOf = new Map(workspace.members.map((m) => [m.id, m.name]));
  const spilledHours = plan.spilled.reduce((sum, s) => sum + s.item.estimateHours, 0);

  return (
    <div className={page.stack}>
      <PageHeader
        title={workspace.sprint.name}
        description="A capacity-aware plan: what fits this sprint, who takes it, and why the rest waits."
        actions={<ResetDemoButton />}
      />

      <Card title="Sprint settings">
        <SprintSettings
          key={`${workspace.sprint.name}|${workspace.sprint.workingDays}`}
          sprint={workspace.sprint}
        />
      </Card>

      <div className={page.stats}>
        <StatTile
          label="Team capacity"
          value={formatHours(plan.capacityHours)}
          detail={`${workspace.members.length} people · ${workspace.sprint.workingDays} days`}
        />
        <StatTile
          label="Committed"
          value={formatHours(plan.plannedHours)}
          detail={`${plan.planned.length} items`}
        />
        <StatTile label="Utilization" value={formatPercent(plan.utilization)} detail="of team capacity" />
        <StatTile
          label="Not this sprint"
          value={plan.spilled.length}
          detail={`${formatHours(spilledHours)} deferred`}
        />
      </div>

      {plan.warnings.length > 0 && (
        <Card title="Risks to review">
          <ul className={page.list}>
            {plan.warnings.map((w) => (
              <li key={w.message} className={page.warning}>
                <span aria-hidden="true">{WARNING_ICON[w.kind]}</span>
                {w.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <CapacityChart loads={plan.loads} />

      <div className={page.columns}>
        <Card title="Committed" description="Ordered by effective priority, then backlog order.">
          {plan.planned.length === 0 ? (
            <EmptyState title="Nothing fits yet" description="Add team members or smaller backlog items." />
          ) : (
            <ScrollRegion label="Committed items">
              <table className={page.table}>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Owner</th>
                    <th scope="col" className={page.num}>
                      Estimate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.planned.map((p) => (
                    <tr key={p.item.id}>
                      <th scope="row">{p.item.title}</th>
                      <td>
                        <PriorityBadge priority={p.effectivePriority} />
                        {p.effectivePriority !== p.item.priority && (
                          <div className={page.muted}>
                            Raised from {p.item.priority}: unblocks urgent work
                          </div>
                        )}
                      </td>
                      <td className={page.nowrap}>{nameOf.get(p.memberId)}</td>
                      <td className={page.num}>{formatHours(p.item.estimateHours)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollRegion>
          )}
        </Card>

        <Card title="Not this sprint" description="Every deferred item, with the reason it did not fit.">
          {plan.spilled.length === 0 ? (
            <EmptyState title="Everything fits" description="The whole backlog is committed this sprint." />
          ) : (
            <ul className={page.list}>
              {plan.spilled.map((s) => (
                <li key={s.item.id} className={page.listItem}>
                  <span className={page.itemHead}>
                    {s.item.title}
                    <PriorityBadge priority={s.item.priority} />
                    <Badge tone={REASON[s.reason].tone}>{REASON[s.reason].label}</Badge>
                  </span>
                  <span className={page.muted}>{s.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
