import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useApi, type Sprint } from '@/shared/api';

/** The whole workspace (sprint, members, backlog): small enough to load as one document. */
export function useWorkspace() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.workspace, queryFn: () => api.getWorkspace() });
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
