"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

/**
 * Built on the native dialog element rather than a div with a high z-index.
 *
 * The browser then provides focus trapping, Escape to dismiss, inertness of the
 * page behind, and correct semantics for assistive technology — all things a
 * hand-rolled overlay has to reimplement and usually gets partly wrong.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      // Fired by Escape as well as by close(), so dismissing with the keyboard
      // keeps React's state in step with the element's.
      onClose={onClose}
      // A click landing on the dialog itself rather than its contents is a
      // click on the backdrop.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] rounded-2xl bg-white p-0 shadow-lifted backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm",
        "open:animate-rise",
        size === "lg" ? "max-w-3xl" : "max-w-lg",
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-m-1.5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

      {footer && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
