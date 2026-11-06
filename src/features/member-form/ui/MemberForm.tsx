import { useRef, useState } from 'react';

import { memberCapacity, useSaveMember } from '@/entities/member';
import { SKILL_LABEL } from '@/entities/work-item';
import { ApiError, isApiError, MemberInputSchema, SKILLS, type Member, type Sprint } from '@/shared/api';
import { formatHours, useFocusFirstError } from '@/shared/lib';
import { Button, SelectField, TextField } from '@/shared/ui';

import styles from './MemberForm.module.css';

interface Values {
  name: string;
  skill: string;
  hoursPerDay: string;
  focusPercent: string;
  ptoDays: string;
  onCallDays: string;
}

const toNumber = (v: string) => (v.trim() === '' ? Number.NaN : Number(v));

function toValues(m?: Member): Values {
  return {
    name: m?.name ?? '',
    skill: m?.skill ?? 'frontend',
    hoursPerDay: String(m?.hoursPerDay ?? 7),
    focusPercent: String(Math.round((m?.focusFactor ?? 0.7) * 100)),
    ptoDays: String(m?.ptoDays ?? 0),
    onCallDays: String(m?.onCallDays ?? 0),
  };
}

function toInput(v: Values) {
  return {
    name: v.name,
    skill: v.skill,
    hoursPerDay: toNumber(v.hoursPerDay),
    focusFactor: toNumber(v.focusPercent) / 100,
    ptoDays: toNumber(v.ptoDays),
    onCallDays: toNumber(v.onCallDays),
  };
}

export interface MemberFormProps {
  member?: Member | undefined;
  sprint: Sprint;
  onDone: () => void;
  onCancel: () => void;
}

/** Create or edit a team member. Validates with the shared schema before calling the API. */
export function MemberForm({ member, sprint, onDone, onCancel }: MemberFormProps) {
  const save = useSaveMember();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(() => toValues(member));
  const [errors, setErrors] = useState<Record<string, string>>({});
  useFocusFirstError(formRef, errors);

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const parsed = MemberInputSchema.safeParse(toInput(values));
  const preview = parsed.success ? memberCapacity({ ...parsed.data, id: 'preview' }, sprint) : undefined;

  const submit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!parsed.success) {
      setErrors({ ...ApiError.fromZod(parsed.error).fieldErrors });
      return;
    }
    setErrors({});
    save.mutate(
      { input: parsed.data, id: member?.id },
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

  const errorFor = (key: string) => errors[key];

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={submit}
      noValidate
      aria-label={member ? `Edit ${member.name}` : 'Add team member'}
    >
      {errors['form'] !== undefined && (
        <p role="alert" className={styles.formError}>
          {errors['form']}
        </p>
      )}
      <div className={styles.grid}>
        <TextField
          label="Name"
          value={values.name}
          onChange={set('name')}
          error={errorFor('name')}
          autoComplete="off"
        />
        <SelectField
          label="Skill"
          value={values.skill}
          onChange={set('skill')}
          error={errorFor('skill')}
          options={SKILLS.map((s) => ({ value: s, label: SKILL_LABEL[s] }))}
        />
        <TextField
          label="Hours per day"
          type="number"
          inputMode="decimal"
          min={1}
          max={12}
          step={0.5}
          value={values.hoursPerDay}
          onChange={set('hoursPerDay')}
          error={errorFor('hoursPerDay')}
        />
        <TextField
          label="Focus factor (%)"
          hint="Share of the day left after meetings and interruptions"
          type="number"
          inputMode="numeric"
          min={30}
          max={100}
          value={values.focusPercent}
          onChange={set('focusPercent')}
          error={errorFor('focusFactor')}
        />
        <TextField
          label="PTO days"
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          value={values.ptoDays}
          onChange={set('ptoDays')}
          error={errorFor('ptoDays')}
        />
        <TextField
          label="On-call days"
          hint="Each on-call day counts as half a day"
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          value={values.onCallDays}
          onChange={set('onCallDays')}
          error={errorFor('onCallDays')}
        />
      </div>
      <div className={styles.footer}>
        <p className={styles.preview} aria-live="polite">
          {preview !== undefined
            ? `Capacity this sprint: ${formatHours(preview)}`
            : 'Fix the highlighted fields to see capacity.'}
        </p>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {member ? 'Save changes' : 'Add member'}
          </Button>
        </div>
      </div>
    </form>
  );
}
