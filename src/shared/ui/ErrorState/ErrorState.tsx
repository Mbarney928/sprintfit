import { Button } from '../Button/Button';
import styles from './ErrorState.module.css';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** An announced error with an optional recovery action. Never shows stack traces. */
export function ErrorState({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try again' }: ErrorStateProps) {
  return (
    <div role="alert" className={styles.error}>
      <p className={styles.title}>
        <span aria-hidden="true">⚠ </span>
        {title}
      </p>
      <p className={styles.message}>{message}</p>
      {onRetry !== undefined && (
        <Button variant="secondary" size="sm" onClick={onRetry} className={styles.retry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
