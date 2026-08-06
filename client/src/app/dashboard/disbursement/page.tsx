"use client";

import { useState } from "react";
import { BanknoteArrowUp, Eye, Send } from "lucide-react";
import { api } from "@/lib/api";
import { useQueue } from "@/hooks/useQueue";
import { ApplicantSummary } from "@/components/dashboard/ApplicantSummary";
import { QueueShell } from "@/components/dashboard/QueueShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/Table";
import { toFormErrors } from "@/lib/formErrors";
import { formatCurrency, formatDate, formatTenure } from "@/lib/format";
import type { LoanWithApplicant } from "@/lib/types";

export default function DisbursementModulePage() {
  const { data, loading, error, reload } = useQueue<{ loans: LoanWithApplicant[] }>(
    "/disbursement/loans",
  );

  const [reviewing, setReviewing] = useState<LoanWithApplicant | null>(null);
  const [confirming, setConfirming] = useState<LoanWithApplicant | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const loans = data?.loans ?? [];
  const totalAwaiting = loans.reduce((sum, loan) => sum + loan.principal, 0);

  function closeAll() {
    setReviewing(null);
    setConfirming(null);
    setActionError(null);
  }

  async function disburse() {
    if (!confirming) return;

    setWorking(true);
    setActionError(null);

    try {
      await api.patch(`/disbursement/loans/${confirming.id}/disburse`);
      closeAll();
      reload();
    } catch (caught) {
      setActionError(toFormErrors(caught).message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations · Disbursement"
        title="Sanctioned loans"
        description="Release funds for applications the sanction team has approved."
      />

      {loans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Awaiting disbursement"
            value={loans.length}
            icon={<Send className="size-4" aria-hidden="true" />}
            tone="brand"
          />
          <StatCard
            label="Total value awaiting"
            value={formatCurrency(totalAwaiting)}
            icon={<BanknoteArrowUp className="size-4" aria-hidden="true" />}
            tone="warning"
          />
        </div>
      )}

      {actionError && !reviewing && !confirming && <Alert tone="error">{actionError}</Alert>}

      <QueueShell
        loading={loading}
        error={error}
        isEmpty={loans.length === 0}
        empty={
          <EmptyState
            title="No loans awaiting disbursement"
            description="Sanctioned applications appear here once the sanction team approves them."
            icon={<Send className="size-6" aria-hidden="true" />}
          />
        }
      >
        <TableWrap>
          <THead>
            <tr>
              <TH>Applicant</TH>
              <TH>Amount</TH>
              <TH>Tenure</TH>
              <TH>Total repayable</TH>
              <TH>Sanctioned</TH>
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
                <TD className="font-medium tabular-nums">{formatCurrency(loan.principal)}</TD>
                <TD className="whitespace-nowrap">{formatTenure(loan.tenureDays)}</TD>
                <TD className="tabular-nums">{formatCurrency(loan.totalRepayment)}</TD>
                <TD className="whitespace-nowrap">
                  {formatDate(loan.sanctionedAt ?? loan.createdAt)}
                </TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setReviewing(loan)}>
                      <Eye className="size-3.5" aria-hidden="true" />
                      Review
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setConfirming(loan)}>
                      <Send className="size-3.5" aria-hidden="true" />
                      Disburse
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
      </QueueShell>

      {/* Review carries the same disburse action, so the reviewer does not have
          to close the dialog to act on what they have just read. */}
      <Modal
        open={Boolean(reviewing)}
        onClose={closeAll}
        title="Sanctioned application"
        description={reviewing?.borrower.name}
        size="lg"
        footer={
          reviewing && (
            <>
              <Button variant="secondary" onClick={closeAll} disabled={working}>
                Close
              </Button>
              <Button
                variant="primary"
                disabled={working}
                onClick={() => {
                  const loan = reviewing;
                  setReviewing(null);
                  setConfirming(loan);
                }}
              >
                Disburse
              </Button>
            </>
          )
        }
      >
        {actionError && (
          <Alert tone="error" className="mb-4">
            {actionError}
          </Alert>
        )}
        {reviewing && <ApplicantSummary loan={reviewing} />}
      </Modal>

      {/* A separate confirmation step, because releasing funds cannot be
          undone the way a sanction decision still can be reconsidered. */}
      <Modal
        open={Boolean(confirming)}
        onClose={closeAll}
        title="Confirm disbursement"
        description={
          confirming
            ? `${confirming.profile.fullName} · ${formatCurrency(confirming.principal)}`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeAll} disabled={working}>
              Cancel
            </Button>
            <Button variant="primary" loading={working} onClick={() => void disburse()}>
              Confirm disbursement
            </Button>
          </>
        }
      >
        {actionError && (
          <Alert tone="error" className="mb-4">
            {actionError}
          </Alert>
        )}
        <p className="text-sm text-slate-600">
          This releases{" "}
          <span className="font-semibold text-slate-900">
            {confirming && formatCurrency(confirming.principal)}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-900">{confirming?.profile.fullName}</span>.
          This cannot be undone — the loan moves to Disbursed and repayment tracking begins.
        </p>
      </Modal>
    </div>
  );
}