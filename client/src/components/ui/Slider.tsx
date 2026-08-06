"use client";

import { useId, type ReactNode } from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Current value, formatted for display beside the label. */
  display: ReactNode;
  minLabel: string;
  maxLabel: string;
}

/**
 * Labelled range control with its own filled track.
 *
 * The browser's default range shows position but not proportion. Drawing the
 * filled portion makes "how far along am I" readable at a glance, which is what
 * someone choosing a loan amount is actually judging.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  minLabel,
  maxLabel,
}: SliderProps) {
  const id = useId();
  const filledPercent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <span className="text-lg font-semibold tracking-tight text-slate-900 tabular-nums">
          {display}
        </span>
      </div>

      <div className="mt-3">
        {/*
          The filled portion is painted as the input's own background rather
          than as an element behind it. A separate element has to be layered
          under the control, and the control's track then paints over it — which
          is exactly what happened here on the first attempt.

          Written as an inline style because the value changes on every drag, so
          it cannot be a static class.
        */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          style={{
            background: `linear-gradient(to right, var(--color-brand-500) 0%, var(--color-brand-600) ${filledPercent}%, var(--color-slate-200) ${filledPercent}%, var(--color-slate-200) 100%)`,
          }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
