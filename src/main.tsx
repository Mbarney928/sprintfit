import '@/shared/ui/styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { AppProviders } from '@/app/providers';
import { createQueryClient } from '@/app/queryClient';
import { routes } from '@/app/routes';
import { applyTheme, useThemeStore } from '@/features/theme-toggle';
import { createLocalApi } from '@/shared/api';

// Apply the saved theme before the first paint to avoid a flash of the wrong theme.
applyTheme(useThemeStore.getState().preference);

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

// Hash routing keeps deep links working on static hosting (GitHub Pages) without rewrites.
const router = createHashRouter(routes);
const api = createLocalApi({ store: window.localStorage, latencyMs: 120 });

createRoot(container).render(
  <StrictMode>
    <AppProviders api={api} queryClient={createQueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
