import { useId, useRef, useState } from 'react';

import { PRIORITY_LABEL, SKILL_LABEL, useSaveItem } from '@/entities/work-item';
import { ApiError, isApiError, PRIORITIES, SKILLS, WorkItemInputSchema, type WorkItem } from '@/shared/api';
import { useFocusFirstError } from '@/shared/lib';
import { Button, SelectField, TextField } from '@/shared/ui';

import styles from './WorkItemForm.module.css';

export interface WorkItemFormProps {
  item?: WorkItem | undefined;
  /** Every backlog item, used to offer dependencies. */
  backlog: readonly WorkItem[];
  onDone: () => void;
  onCancel: () => void;
}

/** Create or edit a backlog item, including the items it depends on. */
export function WorkItemForm({ item, backlog, onDone, onCancel }: WorkItemFormProps) {
  const save = useSaveItem();
  const formRef = useRef<HTMLFormElement>(null);
  const depsErrorId = useId();
  const [title, setTitle] = useState(item?.title ?? '');
  const [estimate, setEstimate] = useState(String(item?.estimateHours ?? 8));
  const [priority, setPriority] = useState<string>(item?.priority ?? 'medium');
  const [skill, setSkill] = useState<string>(item?.skill ?? 'frontend');
  const [dependsOn, setDependsOn] = useState<string[]>(item?.dependsOn ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useFocusFirstError(formRef, errors);

  const options = backlog.filter((b) => b.id !== item?.id);
  const toggle = (id: string) => {
    setDependsOn((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  };

  const submit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const parsed = WorkItemInputSchema.safeParse({
      title,
      estimateHours: estimate.trim() === '' ? Number.NaN : Number(estimate),
      priority,
      skill,
      dependsOn,
    });
    if (!parsed.success) {
      setErrors({ ...ApiError.fromZod(parsed.error).fieldErrors });
      return;
    }
    setErrors({});
    save.mutate(
      { input: parsed.data, id: item?.id },
      {
        onSuccess: onDone,
        onError: (error) => {
          setErrors(
            isApiError(error)
              ? { form: error.message, ...error.fieldErrors }
              : { form: 'Could not save. Try again.' },
          );
        },
      },
    );
  };

  const depsError = errors['dependsOn'];

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={submit}
      noValidate
      aria-label={item ? `Edit ${item.title}` : 'Add work item'}
    >
      {errors['form'] !== undefined && (
        <p role="alert" className={styles.formError}>
          {errors['form']}
        </p>
      )}
      <div className={styles.grid}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          error={errors['title']}
          autoComplete="off"
        />
        <TextField
          label="Estimate (hours)"
          type="number"
          inputMode="decimal"
          min={1}
          max={80}
          value={estimate}
          onChange={(e) => {
            setEstimate(e.target.value);
          }}
          error={errors['estimateHours']}
        />
        <SelectField
          label="Priority"
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
          }}
          error={errors['priority']}
          options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
        />
        <SelectField
          label="Skill"
          value={skill}
          onChange={(e) => {
            setSkill(e.target.value);
          }}
          error={errors['skill']}
          options={SKILLS.map((s) => ({ value: s, label: SKILL_LABEL[s] }))}
        />
      </div>
      {options.length > 0 && (
        <fieldset
          className={styles.deps}
          aria-describedby={depsError !== undefined ? depsErrorId : undefined}
        >
          <legend>Depends on</legend>
          <p className={styles.depsHint}>
            Blocked items are planned only after everything they depend on fits.
          </p>
          {options.map((o) => (
            <label key={o.id} className={styles.check}>
              <input
                type="checkbox"
                checked={dependsOn.includes(o.id)}
                onChange={() => {
                  toggle(o.id);
                }}
                aria-invalid={depsError !== undefined ? true : undefined}
              />
              {o.title}
            </label>
          ))}
          {depsError !== undefined && (
            <p id={depsErrorId} className={styles.depsError}>
              {depsError}
            </p>
          )}
        </fieldset>
      )}
      <div className={styles.footer}>
        <span />
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {item ? 'Save changes' : 'Add item'}
          </Button>
        </div>
      </div>
    </form>
  );
}
