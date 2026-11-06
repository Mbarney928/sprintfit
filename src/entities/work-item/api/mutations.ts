import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useApi, type WorkItemInput } from '@/shared/api';

export function useSaveItem() {
  const api = useApi();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ input, id }: { input: WorkItemInput; id?: string | undefined }) => api.saveItem(input, id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.workspace }),
  });
}

export function useDeleteItem() {
  const api = useApi();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteItem(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.workspace }),
  });
}
