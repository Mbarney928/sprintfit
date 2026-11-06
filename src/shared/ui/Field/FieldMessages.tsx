import styles from './Field.module.css';

export function FieldMessages({ hint, hintId, error, errorId }: { hint?: string | undefined; hintId?: string | undefined; error?: string | undefined; errorId?: string | undefined }) {
  return (
    <>
      {hint !== undefined && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error !== undefined && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </>
  );
}
