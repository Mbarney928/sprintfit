import { useMemo } from 'react';

import { useWorkspace } from '@/entities/sprint';

import { planSprint } from '../model/plan';

/** The workspace query plus the derived plan, recomputed only when the workspace changes. */
export function usePlan() {
  const query = useWorkspace();
  const plan = useMemo(() => (query.data ? planSprint(query.data) : undefined), [query.data]);
  return { ...query, plan };
}
