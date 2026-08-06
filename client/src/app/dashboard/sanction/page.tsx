"use client";

import { useState } from "react";
import { BanknoteArrowUp, Check, Eye, X } from "lucide-react";
import { api } from "@/lib/api";
import { useQueue } from "@/hooks/useQueue";
import { ApplicantSummary } from "@/components/dashboard/ApplicantSummary";
import { QueueShell } from "@/components/dashboard/QueueShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/EmptyState";
import { TextAreaField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/Table";
import { toFormErrors } from "@/lib/formErrors";
import { formatCurrency, formatDate, formatTenure } from "@/lib/format";
import type { LoanWithApplicant } from "@/lib/types";

const MIN_REASON_LENGTH = 10;

export default function SanctionModulePage() {
  const { data, loading, error, reload } = useQueue<{ loans: LoanWithApplicant[] }>(
    "/sanction/applications",
  );

  const [reviewing, setReviewing] = useState<LoanWithApplicant | null>(null);
  const [rejecting, setRejecting] = useState<LoanWithApplicant | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const loans = data?.loans ?? [];

  function closeAll() {
    setReviewing(null);
    setRejecting(null);
    setReason("");
    setReasonError(undefined);
    setActionError(null);
  }

  async function approve(loan: LoanWithApplicant) {
    setWorking(true);
    setActionError(null);

    try {
      await api.patch(`/sanction/applications/${loan.id}/approve`);
      closeAll();
      reload();
    } catch (caught) {
      setActionError(toFormErrors(caught).message);
    } finally {
      setWorking(false);
    }
  }

  async function reject() {
    if (!rejecting) return;

    // Checked here so the reviewer is told immediately, but the server enforces
    // the same minimum — this is convenience, not the rule.
    if (reason.trim().length < MIN_REASON_LENGTH) {
      setReasonError(`Give a reason of at least ${MIN_REASON_LENGTH} characters`);
      return;
    }

    setWorking(true);
    setActionError(null);

    try {
      await api.patch(`/sanction/applications/${rejecting.id}/reject`, { reason: reason.trim() });
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
        eyebrow="Operations · Sanction"
        title="Applications"
        description="Review each application and approve or decline it."
      />

      {actionError && !reviewing && !rejecting && <Alert tone="error">{actionError}</Alert>}

      <QueueShell
        loading={loading}
        error={error}
        isEmpty={loans.length === 0}
        empty={
          <EmptyState
            title="Nothing awaiting review"
            description="New applications appear here as soon as borrowers submit them."
            icon={<BanknoteArrowUp className="size-6" aria-hidden="true" />}
          />
        }
      >
        <TableWrap>
          <THead>
            <tr>
              <TH>Applicant</TH>
              <TH>Amount</TH>
              <TH>Tenure</TH>
              <TH>Monthly salary</TH>
              <TH>Applied</TH>
              <TH className="text-right">Decision</TH>
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
                <TD className="tabular-nums">{formatCurrency(loan.profile.monthlySalary)}</TD>
                <TD className="whitespace-nowrap">{formatDate(loan.createdAt)}</TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setReviewing(loan)}>
                      <Eye className="size-3.5" aria-hidden="true" />
                      Review
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      loading={working}
                      onClick={() => void approve(loan)}
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                      Approve
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setRejecting(loan)}>
                      <X className="size-3.5" aria-hidden="true" />
                      Reject
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
      </QueueShell>

      {/* Review carries the same two decisions, so the reviewer does not have to
          close the dialog to act on what they have just read. */}
      <Modal
        open={Boolean(reviewing)}
        onClose={closeAll}
        title="Application review"
        description={reviewing?.borrower.name}
        size="lg"
        footer={
          reviewing && (
            <>
              <Button variant="secondary" onClick={closeAll} disabled={working}>
                Close
              </Button>
              <Button
                variant="danger"
                disabled={working}
                onClick={() => {
                  const loan = reviewing;
                  setReviewing(null);
                  setRejecting(loan);
                }}
              >
                Reject
              </Button>
              <Button variant="success" loading={working} onClick={() => void approve(reviewing)}>
                Approve
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

      <Modal
        open={Boolean(rejecting)}
        onClose={closeAll}
        title="Decline this application"
        description={
          rejecting
            ? `${rejecting.profile.fullName} · ${formatCurrency(rejecting.principal)}`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeAll} disabled={working}>
              Cancel
            </Button>
            <Button variant="danger" loading={working} onClick={() => void reject()}>
              Decline application
            </Button>
          </>
        }
      >
        {actionError && (
          <Alert tone="error" className="mb-4">
            {actionError}
          </Alert>
        )}
        <TextAreaField
          label="Reason for declining"
          rows={4}
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setReasonError(undefined);
          }}
          error={reasonError}
          hint="Shown to the borrower, so explain what they could change."
          placeholder="For example: reported income could not be verified against the salary slip provided."
        />
      </Modal>
    </div>
  );
}
