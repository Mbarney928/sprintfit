import { useState } from 'react';

import { useWorkspace } from '@/entities/sprint';
import { PriorityBadge, SKILL_LABEL, useDeleteItem } from '@/entities/work-item';
import { WorkItemForm } from '@/features/work-item-form';
import { formatHours } from '@/shared/lib';
import { Button, Card, EmptyState, ScrollRegion, PageHeader } from '@/shared/ui';
import page from '@/shared/ui/styles/page.module.css';
import { WorkspaceStatus } from '@/widgets/workspace-status';

type Editing = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; id: string };

export function BacklogPage() {
  const { data: workspace, isPending, error, refetch } = useWorkspace();
  const remove = useDeleteItem();
  const [editing, setEditing] = useState<Editing>({ mode: 'closed' });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!workspace)
    return <WorkspaceStatus isPending={isPending} error={error} onRetry={() => void refetch()} />;

  const titleOf = new Map(workspace.items.map((i) => [i.id, i.title]));
  const editingItem = editing.mode === 'edit' ? workspace.items.find((i) => i.id === editing.id) : undefined;
  const totalHours = workspace.items.reduce((sum, i) => sum + i.estimateHours, 0);
  const close = () => {
    setEditing({ mode: 'closed' });
  };

  return (
    <div className={page.stack}>
      <PageHeader
        title="Backlog"
        description="Order matters: within the same priority, items higher in the backlog are planned first."
        actions={
          editing.mode === 'closed' && (
            <Button
              onClick={() => {
                setEditing({ mode: 'new' });
              }}
            >
              Add item
            </Button>
          )
        }
      />

      {editing.mode !== 'closed' && (
        <Card title={editingItem ? `Edit “${editingItem.title}”` : 'New work item'}>
          <WorkItemForm
            key={editingItem?.id ?? 'new'}
            item={editingItem}
            backlog={workspace.items}
            onDone={close}
            onCancel={close}
          />
        </Card>
      )}

      <Card title={`${workspace.items.length} items · ${formatHours(totalHours)}`}>
        {workspace.items.length === 0 ? (
          <EmptyState
            title="The backlog is empty"
            description="Add work items with estimates to start planning."
            action={
              <Button
                onClick={() => {
                  setEditing({ mode: 'new' });
                }}
              >
                Add item
              </Button>
            }
          />
        ) : (
          <ScrollRegion label="Backlog items">
            <table className={page.table}>
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Skill</th>
                  <th scope="col" className={page.num}>
                    Estimate
                  </th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {workspace.items.map((i) => (
                  <tr key={i.id}>
                    <th scope="row">
                      {i.title}
                      {i.dependsOn.length > 0 && (
                        <div className={page.muted}>
                          Depends on {i.dependsOn.map((d) => titleOf.get(d) ?? 'a removed item').join(', ')}
                        </div>
                      )}
                    </th>
                    <td>
                      <PriorityBadge priority={i.priority} />
                    </td>
                    <td>{SKILL_LABEL[i.skill]}</td>
                    <td className={page.num}>{formatHours(i.estimateHours)}</td>
                    <td>
                      <div className={page.rowActions}>
                        {confirmId === i.id ? (
                          <>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={remove.isPending}
                              onClick={() => {
                                remove.mutate(i.id, {
                                  onSettled: () => {
                                    setConfirmId(null);
                                  },
                                });
                              }}
                            >
                              Delete item
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
                              aria-label={`Edit ${i.title}`}
                              onClick={() => {
                                setEditing({ mode: 'edit', id: i.id });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete ${i.title}`}
                              onClick={() => {
                                setConfirmId(i.id);
                              }}
                            >
                              Delete
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
