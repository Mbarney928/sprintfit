import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useApi, type MemberInput } from '@/shared/api';

export function useSaveMember() {
  const api = useApi();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ input, id }: { input: MemberInput; id?: string | undefined }) => api.saveMember(input, id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.workspace }),
  });
}

export function useDeleteMember() {
  const api = useApi();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMember(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.workspace }),
  });
}
