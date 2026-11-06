import { useEffect, type RefObject } from 'react';

/** After a failed submit, moves focus to the first invalid control so keyboard users land on it. */
export function useFocusFirstError(
  formRef: RefObject<HTMLFormElement | null>,
  errors: Record<string, string>,
) {
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors, formRef]);
}
