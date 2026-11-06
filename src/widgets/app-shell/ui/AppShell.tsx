import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router';

import { ThemeToggle } from '@/features/theme-toggle';
import { cn } from '@/shared/lib';
import { Spinner } from '@/shared/ui';

import styles from './AppShell.module.css';

const NAV = [
  { to: '/', label: 'Plan', end: true },
  { to: '/team', label: 'Team', end: false },
  { to: '/backlog', label: 'Backlog', end: false },
];

export function AppShell() {
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <rect x="1" y="12" width="4" height="9" rx="1.5" fill="currentColor" opacity="0.45" />
              <rect x="7" y="7" width="4" height="14" rx="1.5" fill="currentColor" opacity="0.7" />
              <rect x="13" y="2" width="4" height="19" rx="1.5" fill="currentColor" />
            </svg>
            sprintfit
          </span>
          <nav aria-label="Main" className={styles.nav}>
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => cn(styles.link, isActive && styles.active)}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" tabIndex={-1} className={styles.main}>
        <Suspense
          fallback={
            <div className={styles.loading}>
              <Spinner label="Loading page" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <footer className={styles.footer}>
        <p>Demo data is fictional and stays in this browser.</p>
      </footer>
    </div>
  );
}
