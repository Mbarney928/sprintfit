import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib';

import styles from '../Field/Field.module.css';
import { FieldMessages } from '../Field/FieldMessages';
import { useFieldA11y } from '../Field/useFieldA11y';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  hint?: string;
  /** Validation message; marks the input invalid and is announced with it. */
  error?: string | undefined;
  className?: string;
}

export function TextField({ label, hint, error, id, className, ...input }: TextFieldProps) {
  const { controlId, hintId, errorId, controlProps } = useFieldA11y(id, hint, error);
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={controlId} className={styles.label}>
        {label}
      </label>
      <input className={styles.control} {...controlProps} {...input} />
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
