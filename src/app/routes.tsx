import type { RouteObject } from 'react-router';

import { AppShell } from '@/widgets/app-shell';

import { RouteError } from './RouteError';

/** Each page is its own lazily loaded chunk. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/pages/plan')).PlanPage }) },
      { path: 'team', lazy: async () => ({ Component: (await import('@/pages/team')).TeamPage }) },
      { path: 'backlog', lazy: async () => ({ Component: (await import('@/pages/backlog')).BacklogPage }) },
      { path: '*', lazy: async () => ({ Component: (await import('@/pages/not-found')).NotFoundPage }) },
    ],
  },
];
