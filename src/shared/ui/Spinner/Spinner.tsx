import { cn } from '@/shared/lib';

import styles from './Spinner.module.css';

export interface SpinnerProps {
  /** Accessible name announced to screen readers. */
  label?: string;
  size?: 'sm' | 'md';
  className?: string | undefined;
}

export function Spinner({ label = 'Loading', size = 'md', className }: SpinnerProps) {
  return (
    <span role="status" className={cn(styles.spinner, styles[size], className)}>
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
