import { isRouteErrorResponse, useRouteError } from 'react-router';

import { ErrorState } from '@/shared/ui';

/** Route-level error boundary: a friendly message, never a stack trace. */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'This page failed to load.';
  return (
    <div style={{ maxWidth: 640, margin: '48px auto', padding: '0 16px' }}>
      <ErrorState
        message={message}
        onRetry={() => {
          window.location.reload();
        }}
        retryLabel="Reload"
      />
    </div>
  );
}
