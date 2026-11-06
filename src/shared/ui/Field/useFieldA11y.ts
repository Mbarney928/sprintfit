import { useId } from 'react';

/** Wires a label, hint and error message to a form control by id. */
export function useFieldA11y(id: string | undefined, hint: string | undefined, error: string | undefined) {
  const autoId = useId();
  const controlId = id ?? autoId;
  const hintId = hint !== undefined ? `${controlId}-hint` : undefined;
  const errorId = error !== undefined ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ');
  return {
    controlId,
    hintId,
    errorId,
    controlProps: {
      id: controlId,
      'aria-invalid': error !== undefined ? true : undefined,
      'aria-describedby': describedBy === '' ? undefined : describedBy,
    },
  };
}
