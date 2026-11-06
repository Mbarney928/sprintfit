import { createContext, use } from 'react';

import type { SprintApi } from './client';

export const ApiContext = createContext<SprintApi | null>(null);

/** The API instance provided by <ApiProvider>. */
export function useApi(): SprintApi {
  const api = use(ApiContext);
  if (!api) throw new Error('useApi must be used inside <ApiProvider>');
  return api;
}
