import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';

import styles from './ScrollRegion.module.css';

export interface ScrollRegionProps {
  /** Names the region, e.g. "Team members". */
  label: string;
  children: ReactNode;
  className?: string | undefined;
}

/**
 * A horizontally scrollable, labelled region for wide tables on small screens. It is
 * focusable so keyboard users can scroll it (WCAG 2.1.1; axe "scrollable-region-focusable").
 */
export function ScrollRegion({ label, children, className }: ScrollRegionProps) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable content must be keyboard-reachable
    <div className={cn(styles.region, className)} tabIndex={0} role="region" aria-label={label}>
      {children}
    </div>
  );
}
