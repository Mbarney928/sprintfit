import { useRef, useState } from 'react';

import { useUpdateSprint } from '@/entities/sprint';
import { ApiError, isApiError, SprintSchema, type Sprint } from '@/shared/api';
import { useFocusFirstError } from '@/shared/lib';
import { Button, TextField } from '@/shared/ui';

import styles from './SprintSettings.module.css';

export function SprintSettings({ sprint }: { sprint: Sprint }) {
  const update = useUpdateSprint();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(sprint.name);
  const [days, setDays] = useState(String(sprint.workingDays));
  const [errors, setErrors] = useState<Record<string, string>>({});
  useFocusFirstError(formRef, errors);

  const dirty = name !== sprint.name || days !== String(sprint.workingDays);

  const submit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const parsed = SprintSchema.safeParse({
      name,
      workingDays: days.trim() === '' ? Number.NaN : Number(days),
    });
    if (!parsed.success) {
      setErrors({ ...ApiError.fromZod(parsed.error).fieldErrors });
      return;
    }
    setErrors({});
    update.mutate(parsed.data, {
      onError: (error) => {
        setErrors(isApiError(error) ? { ...error.fieldErrors } : { name: 'Could not save. Try again.' });
      },
    });
  };

  return (
    <form ref={formRef} className={styles.form} onSubmit={submit} noValidate aria-label="Sprint settings">
      <TextField
        label="Sprint name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        error={errors['name']}
        className={styles.name}
      />
      <TextField
        label="Working days"
        type="number"
        inputMode="numeric"
        min={1}
        max={20}
        value={days}
        onChange={(e) => {
          setDays(e.target.value);
        }}
        error={errors['workingDays']}
        className={styles.days}
      />
      <Button
        type="submit"
        variant="secondary"
        loading={update.isPending}
        disabled={!dirty}
        className={styles.save}
      >
        Update sprint
      </Button>
    </form>
  );
}
