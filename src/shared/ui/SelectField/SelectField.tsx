import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/lib';

import styles from '../Field/Field.module.css';
import { FieldMessages } from '../Field/FieldMessages';
import { useFieldA11y } from '../Field/useFieldA11y';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'multiple'> {
  label: string;
  options: readonly SelectOption[];
  hint?: string;
  error?: string | undefined;
  className?: string;
}

export function SelectField({ label, options, hint, error, id, className, ...select }: SelectFieldProps) {
  const { controlId, hintId, errorId, controlProps } = useFieldA11y(id, hint, error);
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={controlId} className={styles.label}>
        {label}
      </label>
      <select className={styles.control} {...controlProps} {...select}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
