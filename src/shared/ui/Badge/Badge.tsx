import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';

import styles from './Badge.module.css';

const badge = cva(styles.badge, {
  variants: {
    tone: {
      neutral: styles.neutral,
      info: styles.info,
      success: styles.success,
      warning: styles.warning,
      critical: styles.critical,
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export interface BadgeProps extends VariantProps<typeof badge> {
  children: ReactNode;
  /** Optional leading icon; status tones should always pair color with an icon or text. */
  icon?: ReactNode;
  className?: string;
}

export function Badge({ tone, icon, className, children }: BadgeProps) {
  return (
    <span className={cn(badge({ tone }), className)}>
      {icon !== undefined && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
