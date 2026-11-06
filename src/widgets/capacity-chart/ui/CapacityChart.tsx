import { useId, useState } from 'react';

import { OVERLOAD_THRESHOLD, type MemberLoad } from '@/features/plan-sprint';
import { SKILL_LABEL } from '@/entities/work-item';
import { formatHours, formatPercent } from '@/shared/lib';
import { Button, Card, EmptyState, ScrollRegion } from '@/shared/ui';

import { niceScale } from '../model/scale';
import styles from './CapacityChart.module.css';

export interface CapacityChartProps {
  loads: readonly MemberLoad[];
}

function status(load: MemberLoad): { icon: string; label: string } | undefined {
  if (load.capacityHours === 0) return { icon: '⊘', label: 'Unavailable' };
  if (load.utilization >= OVERLOAD_THRESHOLD) return { icon: '⚠', label: 'No slack' };
  return undefined;
}

/**
 * Planned hours against each person's capacity. One series, so no legend: the title names
 * it. Each bar is direct-labelled; a per-bar tooltip adds detail and a table view is available.
 */
export function CapacityChart({ loads }: CapacityChartProps) {
  const [asTable, setAsTable] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const tooltipId = useId();
  const { max, ticks } = niceScale(Math.max(0, ...loads.map((l) => l.capacityHours)));

  return (
    <Card
      title="Planned hours vs. capacity"
      description="Bars show planned work; the track behind each bar is that person’s capacity."
      actions={
        loads.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={asTable}
            onClick={() => {
              setAsTable((t) => !t);
            }}
          >
            {asTable ? 'Show chart' : 'Show table'}
          </Button>
        )
      }
    >
      {loads.length === 0 ? (
        <EmptyState title="No team members yet" description="Add people on the Team page to see capacity." />
      ) : asTable ? (
        <ScrollRegion label="Capacity table">
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Person</th>
                <th scope="col">Skill</th>
                <th scope="col">Capacity</th>
                <th scope="col">Planned</th>
                <th scope="col">Free</th>
                <th scope="col">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((l) => (
                <tr key={l.member.id}>
                  <th scope="row">{l.member.name}</th>
                  <td>{SKILL_LABEL[l.member.skill]}</td>
                  <td>{formatHours(l.capacityHours)}</td>
                  <td>{formatHours(l.plannedHours)}</td>
                  <td>{formatHours(l.capacityHours - l.plannedHours)}</td>
                  <td>{formatPercent(l.utilization)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      ) : (
        <figure
          className={styles.figure}
          style={{ ['--grid-step' as string]: `${100 / (ticks.length - 1)}%` }}
        >
          <ul className={styles.rows} aria-label="Planned hours by person">
            {loads.map((l) => {
              const s = status(l);
              const isActive = active === l.member.id;
              return (
                <li key={l.member.id} className={styles.row}>
                  <span className={styles.name}>
                    {l.member.name}
                    <span className={styles.skill}>{SKILL_LABEL[l.member.skill]}</span>
                  </span>
                  <span className={styles.plotWrap}>
                    <button
                      type="button"
                      className={styles.plot}
                      onClick={() => {
                        setActive(l.member.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setActive(null);
                      }}
                      aria-describedby={isActive ? tooltipId : undefined}
                      onMouseEnter={() => {
                        setActive(l.member.id);
                      }}
                      onMouseLeave={() => {
                        setActive(null);
                      }}
                      onFocus={() => {
                        setActive(l.member.id);
                      }}
                      onBlur={() => {
                        setActive(null);
                      }}
                    >
                      <span className={styles.track} style={{ width: `${(l.capacityHours / max) * 100}%` }}>
                        <span
                          className={styles.bar}
                          style={{
                            width: `${l.capacityHours > 0 ? (l.plannedHours / l.capacityHours) * 100 : 0}%`,
                          }}
                        />
                      </span>
                      <span className="visually-hidden">
                        {`${l.member.name}: ${formatHours(l.plannedHours)} planned of ${formatHours(l.capacityHours)} capacity`}
                      </span>
                    </button>
                    {isActive && (
                      <span role="tooltip" id={tooltipId} className={styles.tooltip}>
                        <strong>{l.member.name}</strong>
                        <span>Capacity {formatHours(l.capacityHours)}</span>
                        <span>Planned {formatHours(l.plannedHours)}</span>
                        <span>Free {formatHours(l.capacityHours - l.plannedHours)}</span>
                        <span>
                          {l.itemIds.length} item{l.itemIds.length === 1 ? '' : 's'}
                        </span>
                      </span>
                    )}
                  </span>
                  <span className={styles.value}>
                    {formatHours(l.plannedHours)} / {formatHours(l.capacityHours)}
                    <span className={styles.pct}> · {formatPercent(l.utilization)}</span>
                    {s !== undefined && (
                      <span className={styles.status}>
                        <span aria-hidden="true">{s.icon}</span> {s.label}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className={styles.axis} aria-hidden="true">
            {ticks.map((t, i) => (
              <span key={i} style={{ left: `${(t / max) * 100}%` }}>
                {formatHours(t)}
              </span>
            ))}
          </div>
        </figure>
      )}
    </Card>
  );
}
