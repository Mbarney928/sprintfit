import type { ReactNode } from 'react';

import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** The page's single <h1>, with optional supporting text and actions. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {description !== undefined && <p className={styles.description}>{description}</p>}
      </div>
      {actions !== undefined && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
