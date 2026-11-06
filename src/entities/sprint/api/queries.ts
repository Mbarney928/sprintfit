import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDeferredValue } from 'react';

import { queryKeys, useApi, type Sprint } from '@/shared/api';

/** The whole workspace (sprint, members, backlog): small enough to load as one document. */
export function useWorkspace() {
  const api = useApi();
  const query = useQuery({ queryKey: queryKeys.workspace, queryFn: () => api.getWorkspace() });
  // Query results arrive as synchronous store updates, so the first full-page render would run as a
  // single long main-thread task. Deferring the data lets React render it in interruptible slices
  // (the loading skeleton stays up meanwhile), which keeps Total Blocking Time low on slow CPUs.
  const data = useDeferredValue(query.data);
  return {
    ...query,
    data,
    isPending: query.isPending || (query.data !== undefined && data === undefined),
  };
}

export function useUpdateSprint() {
  const api = useApi();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Sprint) => api.updateSprint(input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.workspace }),
  });
}

export function useResetDemo() {
  const api = useApi();
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.resetDemo(),
    onSuccess: (workspace) => {
      client.setQueryData(queryKeys.workspace, workspace);
    },
  });
}
