import type { ReactNode } from 'react';

import type { SprintApi } from './client';
import { ApiContext } from './context';

export function ApiProvider({ api, children }: { api: SprintApi; children: ReactNode }) {
  return <ApiContext value={api}>{children}</ApiContext>;
}
