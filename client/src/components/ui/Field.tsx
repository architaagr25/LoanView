"use client";

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const CONTROL_BASE = cn(
  "w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-slate-900",
  "ring-1 ring-inset transition-all duration-150",
  "placeholder:text-slate-400",
  "focus:outline-none focus:ring-2",
  "disabled:bg-slate-50 disabled:text-slate-500",
);

// The focus state widens the ring and tints the surface, so the active field is
// obvious at a glance rather than announced by a one-pixel colour change.
const CONTROL_NORMAL = "ring-slate-200 hover:ring-slate-300 focus:ring-brand-500 focus:bg-brand-50/30";
const CONTROL_INVALID = "ring-rose-300 focus:ring-rose-500 focus:bg-rose-50/30";

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
      {/* The error replaces the hint rather than stacking below it, so the
          layout does not shift as messages appear and clear. */}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center gap-1.5 text-sm text-rose-600 animate-slide-down"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
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
  /** Rendered inside the field, before the text. */
  icon?: ReactNode;
  /** Rendered inside the field, after the text — a unit or suffix. */
  suffix?: ReactNode;
}

export function TextField({
  label,
  hint,
  error,
  icon,
  suffix,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          // Announced to assistive technology, so the error is not conveyed by
          // colour and position alone.
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            CONTROL_BASE,
            error ? CONTROL_INVALID : CONTROL_NORMAL,
            // Ternaries rather than && — a ReactNode may legitimately be the
            // number 0, which would otherwise leak into the class list.
            icon ? "pl-10" : undefined,
            suffix ? "pr-16" : undefined,
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
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
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            CONTROL_BASE,
            error ? CONTROL_INVALID : CONTROL_NORMAL,
            // The native arrow is replaced so the control matches the text
            // fields; without this it looks like a different design system.
            "appearance-none pr-10",
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 right-3.5 my-auto size-4 text-slate-400"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextAreaField({ label, hint, error, className, ...props }: TextAreaFieldProps) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          CONTROL_BASE,
          error ? CONTROL_INVALID : CONTROL_NORMAL,
          // Vertical only. Free resizing lets a textarea be dragged wider than
          // its container, which breaks the layout around it.
          "resize-y",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}
