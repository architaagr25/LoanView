import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "success" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // A gradient rather than a flat fill, and a shadow tinted with the brand
  // colour instead of neutral grey — a grey shadow under a coloured button
  // always reads as slightly dirty.
  primary: cn(
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-brand",
    "hover:from-brand-500 hover:to-brand-700 hover:shadow-brand-hover hover:-translate-y-px",
    "active:translate-y-0 active:shadow-brand",
    "disabled:from-brand-300 disabled:to-brand-300 disabled:shadow-none disabled:translate-y-0",
  ),
  secondary: cn(
    "bg-white text-slate-700 ring-1 ring-slate-200 ring-inset shadow-card",
    "hover:bg-slate-50 hover:text-slate-900 hover:shadow-card-hover hover:ring-slate-300",
    "disabled:text-slate-400 disabled:shadow-none",
  ),
  danger: cn(
    "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_4px_14px_-4px_rgb(225_29_72/0.4)]",
    "hover:from-rose-500 hover:to-rose-700 hover:-translate-y-px",
    "active:translate-y-0 disabled:from-rose-300 disabled:to-rose-300 disabled:shadow-none",
  ),
  success: cn(
    "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_4px_14px_-4px_rgb(16_185_129/0.4)]",
    "hover:from-emerald-500 hover:to-emerald-700 hover:-translate-y-px",
    "active:translate-y-0 disabled:from-emerald-300 disabled:to-emerald-300 disabled:shadow-none",
  ),
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      // A button showing a spinner must also refuse clicks, or a slow request
      // can be submitted twice — which for an approval or a payment means it
      // happens twice.
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium",
        "transition-all duration-200 ease-out",
        "disabled:cursor-not-allowed disabled:hover:translate-y-0",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
