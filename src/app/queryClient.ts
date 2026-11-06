import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // Data is local and every mutation invalidates it, so background refetches add nothing.
      queries: { staleTime: Infinity, refetchOnWindowFocus: false, retry: 1 },
    },
  });
}
