import { useState } from 'react';

import { useResetDemo } from '@/entities/sprint';
import { Button } from '@/shared/ui';

/** Two-step reset: the destructive action needs an explicit confirmation click. */
export function ResetDemoButton() {
  const reset = useResetDemo();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setConfirming(true);
        }}
      >
        Reset demo data
      </Button>
    );
  }
  return (
    <span role="group" aria-label="Confirm reset" style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
      <Button
        variant="danger"
        size="sm"
        loading={reset.isPending}
        onClick={() => {
          reset.mutate(undefined, {
            onSettled: () => {
              setConfirming(false);
            },
          });
        }}
      >
        Replace all data
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setConfirming(false);
        }}
      >
        Keep my data
      </Button>
    </span>
  );
}
