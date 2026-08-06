"use client";

import { useState } from "react";
import { CalendarDays, Eye, IndianRupee, Receipt, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { useQueue } from "@/hooks/useQueue";
import { ApplicantSummary } from "@/components/dashboard/ApplicantSummary";
import { QueueShell } from "@/components/dashboard/QueueShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/EmptyState";
import { TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { LoadingBlock } from "@/components/ui/Spinner";
import { TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/Table";
import { NO_FORM_ERRORS, toFormErrors } from "@/lib/formErrors";
import { formatCurrency, formatDate, todayAsInputValue } from "@/lib/format";
import type { LoanWithApplicant, Payment } from "@/lib/types";

interface RecordPaymentResult {
  loan: LoanWithApplicant;
  payment: Payment;
  closed: boolean;
}

export default function CollectionModulePage() {
  const { data, loading, error, reload } = useQueue<{ loans: LoanWithApplicant[] }>(
    "/collection/loans",
  );

  const [reviewing, setReviewing] = useState<LoanWithApplicant | null>(null);
  const [reviewPayments, setReviewPayments] = useState<Payment[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [recording, setRecording] = useState<LoanWithApplicant | null>(null);
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [paidOn, setPaidOn] = useState(todayAsInputValue());
  const [errors, setErrors] = useState(NO_FORM_ERRORS);
  const [working, setWorking] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loans = data?.loans ?? [];
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
  const totalRepaid = loans.reduce((sum, loan) => sum + loan.amountPaid, 0);

  function closeAll() {
    setReviewing(null);
    setRecording(null);
    setErrors(NO_FORM_ERRORS);
  }

  /**
   * The queue list carries no payment history — fetched on open rather than
   * for every row, since only the row actually being reviewed needs it.
   */
  async function openReview(loan: LoanWithApplicant) {
    setSuccessMessage(null);
    setReviewing(loan);
    setReviewPayments([]);
    setReviewLoading(true);

    try {
      const result = await api.get<{ loan: LoanWithApplicant; payments: Payment[] }>(
        `/collection/loans/${loan.id}`,
      );
      setReviewPayments(result.payments);
    } catch {
      // The summary above still renders from data already in hand; only the
      // payment history list depends on this request, so a failure here is
      // quiet rather than blocking the modal.
    } finally {
      setReviewLoading(false);
    }
  }

  function openRecord(loan: LoanWithApplicant) {
    setSuccessMessage(null);
    setRecording(loan);
    setAmount("");
    setUtrNumber("");
    setPaidOn(todayAsInputValue());
    setErrors(NO_FORM_ERRORS);
  }

  async function recordPayment() {
    if (!recording) return;

    setErrors(NO_FORM_ERRORS);
    setWorking(true);

    try {
      const result = await api.post<RecordPaymentResult>(
        `/collection/loans/${recording.id}/payments`,
        { utrNumber, amount: Number(amount), paidOn },
      );

      const borrowerName = recording.profile.fullName;
      closeAll();

      if (result.closed) {
        setSuccessMessage(`Payment recorded — ${borrowerName}'s loan is fully repaid and closed.`);
      }

      reload();
    } catch (caught) {
      setErrors(toFormErrors(caught));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations · Collection"
        title="Active loans"
        description="Disbursed loans with repayments still outstanding."
      />

      {loans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Active loans"
            value={loans.length}
            icon={<Wallet className="size-4" aria-hidden="true" />}
            tone="brand"
          />
          <StatCard
            label="Total outstanding"
            value={formatCurrency(totalOutstanding)}
            icon={<CalendarDays className="size-4" aria-hidden="true" />}
            tone="warning"
          />
          <StatCard
            label="Total repaid"
            value={formatCurrency(totalRepaid)}
            icon={<IndianRupee className="size-4" aria-hidden="true" />}
            tone="success"
          />
        </div>
      )}

      {successMessage && !reviewing && !recording && (
        <Alert tone="success" title="Loan closed">
          {successMessage}
        </Alert>
      )}

      <QueueShell
        loading={loading}
        error={error}
        isEmpty={loans.length === 0}
        empty={
          <EmptyState
            title="No active loans"
            description="Loans appear here once funds are disbursed."
            icon={<Wallet className="size-6" aria-hidden="true" />}
          />
        }
      >
        <TableWrap>
          <THead>
            <tr>
              <TH>Applicant</TH>
              <TH>Principal</TH>
              <TH>Total repayable</TH>
              <TH>Repaid</TH>
              <TH>Outstanding</TH>
              <TH>Disbursed</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </THead>
          <TBody>
            {loans.map((loan) => (
              <TR key={loan.id}>
                <TD>
                  <p className="font-medium text-slate-900">{loan.profile.fullName}</p>
                  <p className="font-mono text-xs text-slate-500">{loan.profile.pan}</p>
                </TD>
                <TD className="tabular-nums">{formatCurrency(loan.principal)}</TD>
                <TD className="tabular-nums">{formatCurrency(loan.totalRepayment)}</TD>
                <TD className="tabular-nums">{formatCurrency(loan.amountPaid)}</TD>
                <TD className="font-medium tabular-nums text-amber-700">
                  {formatCurrency(loan.outstandingAmount)}
                </TD>
                <TD className="whitespace-nowrap">
                  {loan.disbursedAt ? formatDate(loan.disbursedAt) : "—"}
                </TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => void openReview(loan)}>
                      <Eye className="size-3.5" aria-hidden="true" />
                      Review
                    </Button>
                    <Button variant="success" size="sm" onClick={() => openRecord(loan)}>
                      <Receipt className="size-3.5" aria-hidden="true" />
                      Record payment
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
      </QueueShell>

      <Modal
        open={Boolean(reviewing)}
        onClose={closeAll}
        title="Loan detail"
        description={reviewing?.borrower.name}
        size="lg"
        footer={
          reviewing && (
            <>
              <Button variant="secondary" onClick={closeAll}>
                Close
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  const loan = reviewing;
                  setReviewing(null);
                  openRecord(loan);
                }}
              >
                Record payment
              </Button>
            </>
          )
        }
      >
        {reviewing && (
          <div className="space-y-6">
            <ApplicantSummary loan={reviewing} />

            <section>
              <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Payment history
              </h3>
              <div className="mt-2">
                {reviewLoading ? (
                  <LoadingBlock label="Loading payments" />
                ) : reviewPayments.length === 0 ? (
                  <p className="text-sm text-slate-500">No payments recorded yet.</p>
                ) : (
                  <TableWrap minWidth="min-w-[20rem]">
                    <THead>
                      <tr>
                        <TH>Date</TH>
                        <TH>UTR number</TH>
                        <TH className="text-right">Amount</TH>
                      </tr>
                    </THead>
                    <TBody>
                      {reviewPayments.map((payment) => (
                        <TR key={payment.id}>
                          <TD>{formatDate(payment.paidOn)}</TD>
                          <TD className="font-mono text-xs">{payment.utrNumber}</TD>
                          <TD className="text-right font-medium tabular-nums">
                            {formatCurrency(payment.amount)}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </TableWrap>
                )}
              </div>
            </section>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(recording)}
        onClose={closeAll}
        title="Record a repayment"
        description={
          recording
            ? `${recording.profile.fullName} · outstanding ${formatCurrency(recording.outstandingAmount)}`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeAll} disabled={working}>
              Cancel
            </Button>
            <Button variant="success" loading={working} onClick={() => void recordPayment()}>
              Record payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {errors.message && <Alert tone="error">{errors.message}</Alert>}

          <div>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0.01}
              max={recording?.outstandingAmount}
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              error={errors.fields.amount}
              hint={
                recording
                  ? `Outstanding ${formatCurrency(recording.outstandingAmount)}. Paying the full balance closes the loan.`
                  : undefined
              }
              placeholder="0.00"
              icon={<IndianRupee className="size-4" aria-hidden="true" />}
            />
            {recording && (
              <button
                type="button"
                onClick={() => setAmount(recording.outstandingAmount.toFixed(2))}
                className="mt-1.5 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                Pay full outstanding ({formatCurrency(recording.outstandingAmount)})
              </button>
            )}
          </div>

          <TextField
            label="UTR number"
            name="utrNumber"
            required
            value={utrNumber}
            onChange={(event) => setUtrNumber(event.target.value.toUpperCase())}
            error={errors.fields.utrNumber}
            hint="Unique Transaction Reference from the bank transfer, 6–30 characters"
            placeholder="UTR2024081512345"
            maxLength={30}
            className="font-mono tracking-wider uppercase"
          />

          <TextField
            label="Paid on"
            name="paidOn"
            type="date"
            required
            value={paidOn}
            onChange={(event) => setPaidOn(event.target.value)}
            error={errors.fields.paidOn}
            max={todayAsInputValue()}
          />
        </div>
      </Modal>
    </div>
  );
}