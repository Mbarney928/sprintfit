import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';

import { Skeleton } from '../Skeleton/Skeleton';
import styles from './StatTile.module.css';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Supporting context, e.g. "of 290h capacity". */
  detail?: ReactNode;
  loading?: boolean;
  className?: string | undefined;
}

/** A single headline number. Uses <dl> semantics so label and value are read together. */
export function StatTile({ label, value, detail, loading = false, className }: StatTileProps) {
  return (
    <dl className={cn(styles.tile, className)} aria-busy={loading || undefined}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{loading ? <Skeleton width="4ch" height="1.2em" /> : value}</dd>
      {detail !== undefined && (
        <dd className={styles.detail}>{loading ? <Skeleton width="10ch" /> : detail}</dd>
      )}
    </dl>
  );
}
