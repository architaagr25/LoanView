import { ApiError } from "./api";

export interface FormErrorState {
  /** Shown above the form. */
  message: string;
  /** Keyed by field name, shown beneath the matching input. */
  fields: Record<string, string>;
}

/**
 * Turns a rejected request into something a form can render.
 *
 * The server reports validation failures per field, so those are attached to
 * their inputs rather than being flattened into one message at the top — the
 * user can see which box to fix instead of reading a list and hunting.
 */
export function toFormErrors(error: unknown): FormErrorState {
  if (error instanceof ApiError) {
    const fields: Record<string, string> = {};

    for (const fieldError of error.fieldErrors) {
      // Keep the first message per field. Later ones are usually consequences
      // of the same mistake and only add noise.
      if (!fields[fieldError.field]) {
        fields[fieldError.field] = fieldError.message;
      }
    }

    return { message: error.message, fields };
  }

  return {
    message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
    fields: {},
  };
}

export const NO_FORM_ERRORS: FormErrorState = { message: "", fields: {} };

/**
 * Whether the banner above the form is worth showing.
 *
 * When every problem is already marked on its own field, a generic "Validation
 * failed" heading tells the user nothing they cannot already see, and pushes
 * the fields further down the page. The banner is for failures that belong to
 * no single field — a wrong password, a refused transition, an unreachable API.
 */
export function shouldShowSummary(errors: FormErrorState): boolean {
  return Boolean(errors.message) && Object.keys(errors.fields).length === 0;
}
