import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import { AppProviders } from '@/app/providers';
import { createQueryClient } from '@/app/queryClient';
import { createLocalApi } from '@/shared/api';

/** Renders a component inside the API and query providers backed by an in-memory store. */
export function renderWithApi(ui: ReactNode) {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { ...queryClient.getDefaultOptions().queries, retry: false } });
  const api = createLocalApi({ store: window.localStorage });
  return render(
    <AppProviders api={api} queryClient={queryClient}>
      {ui}
    </AppProviders>,
  );
}
