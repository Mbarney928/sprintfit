import type { z } from 'zod';

export type ApiErrorCode = 'validation' | 'not_found' | 'corrupt_storage';

/** The single error type the API layer throws, so the UI can handle every failure the same way. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly fieldErrors: Readonly<Record<string, string>>;

  constructor(code: ApiErrorCode, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** Builds a validation error keyed by field path (first message per field wins). */
  static fromZod(error: z.ZodError): ApiError {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || 'form';
      fields[key] ??= issue.message;
    }
    return new ApiError('validation', 'Some fields need attention.', fields);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
