import { cn } from '@/shared/lib';

import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

/** Decorative placeholder shown while content loads; hidden from assistive technology. */
export function Skeleton({ width = '100%', height = '1em', className }: SkeletonProps) {
  return <span aria-hidden="true" className={cn(styles.skeleton, className)} style={{ width, height }} />;
}
