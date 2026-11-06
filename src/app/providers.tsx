import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ApiProvider, type SprintApi } from '@/shared/api';

export function AppProviders({
  api,
  queryClient,
  children,
}: {
  api: SprintApi;
  queryClient: QueryClient;
  children: ReactNode;
}) {
  return (
    <ApiProvider api={api}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiProvider>
  );
}
