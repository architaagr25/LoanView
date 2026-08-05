"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const CONTROL_BASE =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500";

const CONTROL_NORMAL = "border-slate-300";
const CONTROL_INVALID = "border-rose-400";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {/* An error replaces the hint rather than stacking below it, so the
          layout does not shift as messages appear and clear. */}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ label, hint, error, className, ...props }: TextFieldProps) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        // Announced to screen readers, so the error is not conveyed by colour
        // and position alone.
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL_BASE, error ? CONTROL_INVALID : CONTROL_NORMAL, className)}
        {...props}
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  ...props
}: SelectFieldProps) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL_BASE, error ? CONTROL_INVALID : CONTROL_NORMAL, className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
