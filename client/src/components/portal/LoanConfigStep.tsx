"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, Info, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import {
  ANNUAL_INTEREST_RATE,
  LOAN_AMOUNT_STEP,
  MAX_LOAN_AMOUNT,
  MAX_TENURE_DAYS,
  MIN_LOAN_AMOUNT,
  MIN_TENURE_DAYS,
  TENURE_STEP_DAYS,
} from "@/lib/constants";
import { formatCurrency, formatCurrencyCompact, formatTenure } from "@/lib/format";
import { quoteLoan } from "@/lib/loanMath";
import { toFormErrors } from "@/lib/formErrors";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";

interface LoanConfigStepProps {
  onApplied: () => void;
  onBack: () => void;
}

export function LoanConfigStep({ onApplied, onBack }: LoanConfigStepProps) {
  const [amount, setAmount] = useState(200_000);
  const [tenureDays, setTenureDays] = useState(180);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Recomputed on every slider movement, which is why it runs locally rather
  // than asking the server for a quote on each pixel.
  const quote = useMemo(() => quoteLoan(amount, tenureDays), [amount, tenureDays]);

  async function handleApply() {
    setSubmitting(true);
    setError(null);

    try {
      // Only the two chosen values are sent. Every figure shown above is
      // recalculated by the server, so the panel cannot dictate the terms.
      await api.post("/borrower/loans", { amount, tenureDays });
      onApplied();
    } catch (caught) {
      setError(toFormErrors(caught).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader
          title="Loan amount and tenure"
          description="Move the sliders to see what you would repay."
          icon={<SlidersHorizontal className="size-4.5" aria-hidden="true" />}
        />
        <CardBody className="space-y-8">
          {error && <Alert tone="error">{error}</Alert>}

          <Slider
            label="Loan amount"
            value={amount}
            min={MIN_LOAN_AMOUNT}
            max={MAX_LOAN_AMOUNT}
            step={LOAN_AMOUNT_STEP}
            onChange={setAmount}
            display={formatCurrencyCompact(amount)}
            minLabel={formatCurrencyCompact(MIN_LOAN_AMOUNT)}
            maxLabel={formatCurrencyCompact(MAX_LOAN_AMOUNT)}
          />

          <Slider
            label="Tenure"
            value={tenureDays}
            min={MIN_TENURE_DAYS}
            max={MAX_TENURE_DAYS}
            step={TENURE_STEP_DAYS}
            onChange={setTenureDays}
            display={`${tenureDays} days`}
            minLabel={`${MIN_TENURE_DAYS} days`}
            maxLabel={`${MAX_TENURE_DAYS} days`}
          />

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-500 ring-1 ring-slate-100 ring-inset">
            <Info className="mt-px size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <p>
              Interest is simple interest at a fixed {ANNUAL_INTEREST_RATE}% per annum, calculated
              as principal × rate × days ÷ (365 × 100). There are no fees.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* The figures follow the sliders on a wide screen and sit beneath them on
          a narrow one, where a sticky panel would cover the controls it
          describes. */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-6">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 20rem 12rem at 100% 0%, rgb(6 182 212 / 0.4), transparent)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <p className="text-xs font-medium tracking-wider text-brand-200 uppercase">
                Total repayable
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-white tabular-nums">
                {formatCurrency(quote.totalRepayment)}
              </p>
              <p className="mt-1 text-sm text-brand-200">over {formatTenure(quote.tenureDays)}</p>
            </div>
          </div>

          <CardBody className="space-y-1">
            <Line label="Principal" value={formatCurrency(quote.principal)} />
            <Line label={`Interest at ${quote.interestRate}% p.a.`} value={formatCurrency(quote.interestAmount)} />
            <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-3">
              <span className="text-sm font-medium text-slate-900">Total repayment</span>
              <span className="text-base font-semibold text-slate-900 tabular-nums">
                {formatCurrency(quote.totalRepayment)}
              </span>
            </div>
          </CardBody>

          <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <Button type="button" size="lg" fullWidth loading={submitting} onClick={handleApply}>
              {submitting ? "Submitting" : "Submit application"}
              {!submitting && <Check className="size-4" aria-hidden="true" />}
            </Button>
            <p className="mt-2 text-center text-xs text-slate-400">
              Reviewed by our sanction team before any funds are released.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 tabular-nums">{value}</span>
    </div>
  );
}
