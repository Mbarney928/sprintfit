import { ResetDemoButton } from '@/features/reset-demo';
import { isApiError } from '@/shared/api';
import { Card, ErrorState, Skeleton } from '@/shared/ui';

export interface WorkspaceStatusProps {
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}

/** Loading and error states shared by every page that reads the workspace. */
export function WorkspaceStatus({ isPending, error, onRetry }: WorkspaceStatusProps) {
  if (isPending) {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="visually-hidden">Loading workspace</span>
        <Skeleton height="2rem" width="40%" />
        <div style={{ height: 'var(--space-5)' }} />
        <Card>
          <Skeleton height="1.2rem" />
          <div style={{ height: 'var(--space-3)' }} />
          <Skeleton height="1.2rem" width="80%" />
          <div style={{ height: 'var(--space-3)' }} />
          <Skeleton height="1.2rem" width="60%" />
        </Card>
      </div>
    );
  }
  const corrupt = isApiError(error) && error.code === 'corrupt_storage';
  return (
    <div>
      <ErrorState
        title={corrupt ? 'Saved data is unreadable' : 'Could not load the workspace'}
        message={isApiError(error) ? error.message : 'An unexpected error occurred. Try again.'}
        {...(corrupt ? {} : { onRetry })}
      />
      {corrupt && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <ResetDemoButton />
        </div>
      )}
    </div>
  );
}
