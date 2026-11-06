import type { ReactNode } from 'react';
import { useId } from 'react';

import { cn } from '@/shared/lib';

import styles from './Card.module.css';

export interface CardProps {
  title?: string;
  description?: string;
  /** Controls shown at the right of the header (buttons, toggles). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A titled section. The title labels the region for assistive technology. */
export function Card({ title, description, actions, children, className }: CardProps) {
  const titleId = useId();
  return (
    <section className={cn(styles.card, className)} aria-labelledby={title !== undefined ? titleId : undefined}>
      {(title !== undefined || actions !== undefined) && (
        <header className={styles.header}>
          <div>
            {title !== undefined && (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            )}
            {description !== undefined && <p className={styles.description}>{description}</p>}
          </div>
          {actions !== undefined && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
