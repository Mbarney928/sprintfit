import { useState } from 'react';

import { memberCapacity, useDeleteMember } from '@/entities/member';
import { useWorkspace } from '@/entities/sprint';
import { SKILL_LABEL } from '@/entities/work-item';
import { MemberForm } from '@/features/member-form';
import { formatHours, formatPercent } from '@/shared/lib';
import { Button, Card, EmptyState, ScrollRegion, PageHeader } from '@/shared/ui';
import page from '@/shared/ui/styles/page.module.css';
import { WorkspaceStatus } from '@/widgets/workspace-status';

type Editing = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; id: string };

export function TeamPage() {
  const { data: workspace, isPending, error, refetch } = useWorkspace();
  const remove = useDeleteMember();
  const [editing, setEditing] = useState<Editing>({ mode: 'closed' });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!workspace)
    return <WorkspaceStatus isPending={isPending} error={error} onRetry={() => void refetch()} />;

  const editingMember =
    editing.mode === 'edit' ? workspace.members.find((m) => m.id === editing.id) : undefined;
  const close = () => {
    setEditing({ mode: 'closed' });
  };

  return (
    <div className={page.stack}>
      <PageHeader
        title="Team"
        description="Capacity is (working days − PTO − half of each on-call day) × hours per day × focus factor."
        actions={
          editing.mode === 'closed' && (
            <Button
              onClick={() => {
                setEditing({ mode: 'new' });
              }}
            >
              Add member
            </Button>
          )
        }
      />

      {editing.mode !== 'closed' && (
        <Card title={editingMember ? `Edit ${editingMember.name}` : 'New team member'}>
          <MemberForm
            key={editingMember?.id ?? 'new'}
            member={editingMember}
            sprint={workspace.sprint}
            onDone={close}
            onCancel={close}
          />
        </Card>
      )}

      <Card title={`${workspace.members.length} people`}>
        {workspace.members.length === 0 ? (
          <EmptyState
            title="No team members"
            description="Add the people working this sprint to see their capacity."
            action={
              <Button
                onClick={() => {
                  setEditing({ mode: 'new' });
                }}
              >
                Add member
              </Button>
            }
          />
        ) : (
          <ScrollRegion label="Team members">
            <table className={page.table}>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Skill</th>
                  <th scope="col" className={page.num}>
                    Hours/day
                  </th>
                  <th scope="col" className={page.num}>
                    Focus
                  </th>
                  <th scope="col" className={page.num}>
                    PTO
                  </th>
                  <th scope="col" className={page.num}>
                    On-call
                  </th>
                  <th scope="col" className={page.num}>
                    Capacity
                  </th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {workspace.members.map((m) => (
                  <tr key={m.id}>
                    <th scope="row">{m.name}</th>
                    <td>{SKILL_LABEL[m.skill]}</td>
                    <td className={page.num}>{m.hoursPerDay}</td>
                    <td className={page.num}>{formatPercent(m.focusFactor)}</td>
                    <td className={page.num}>{m.ptoDays}d</td>
                    <td className={page.num}>{m.onCallDays}d</td>
                    <td className={page.num}>{formatHours(memberCapacity(m, workspace.sprint))}</td>
                    <td>
                      <div className={page.rowActions}>
                        {confirmId === m.id ? (
                          <>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={remove.isPending}
                              onClick={() => {
                                remove.mutate(m.id, {
                                  onSettled: () => {
                                    setConfirmId(null);
                                  },
                                });
                              }}
                            >
                              Remove {m.name}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setConfirmId(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit ${m.name}`}
                              onClick={() => {
                                setEditing({ mode: 'edit', id: m.id });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Remove ${m.name}`}
                              onClick={() => {
                                setConfirmId(m.id);
                              }}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        )}
      </Card>
    </div>
  );
}
