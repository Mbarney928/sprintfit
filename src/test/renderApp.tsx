import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { AppProviders } from '@/app/providers';
import { createQueryClient } from '@/app/queryClient';
import { routes } from '@/app/routes';
import { createLocalApi } from '@/shared/api';

/** Renders the real app (routes, providers, API, storage) at `path`, with no artificial latency. */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { ...queryClient.getDefaultOptions().queries, retry: false } });
  const api = createLocalApi({ store: window.localStorage });
  return {
    router,
    ...render(
      <AppProviders api={api} queryClient={queryClient}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
}
