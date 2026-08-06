"use client";

import Link from "next/link";
import { useApplication } from "@/hooks/useApplication";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/Spinner";
import { formatCurrency, formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

/**
 * The borrower's home screen. Expanded into a full loan detail view in a later
 * step; for now it reports where the application stands and what to do next.
 */
export default function PortalPage() {
  const { profile, loans, activeLoan, loading, error } = useApplication();

  if (loading) return <LoadingBlock label="Loading your application" />;

  if (error) {
    return (
      <Alert tone="error" title="Could not load your application">
        {error}
      </Alert>
    );
  }

  const nextStepLabel = !profile
    ? "Start your application"
    : !profile.salarySlip
      ? "Continue — upload your salary slip"
      : "Continue — choose your loan amount";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your loans"
        description="Track your application from request through to repayment."
      />

      {!activeLoan && (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {loans.length > 0 ? "Apply for another loan" : "You have no active loan"}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">{nextStepLabel}</p>
            </div>
            <Link href={ROUTES.apply}>
              <Button>{profile ? "Continue" : "Get started"}</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {loans.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing here yet"
            description="Once you apply, your loan and its progress will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <Card key={loan.id}>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(loan.principal)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {loan.tenureDays} days at {loan.interestRate}% p.a. · applied{" "}
                      {formatDate(loan.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>

                {loan.status === "REJECTED" && loan.rejectionReason && (
                  <Alert tone="error" title="Application declined">
                    {loan.rejectionReason}
                  </Alert>
                )}

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  <Figure label="Interest" value={formatCurrency(loan.interestAmount)} />
                  <Figure label="Total repayable" value={formatCurrency(loan.totalRepayment)} />
                  <Figure label="Paid" value={formatCurrency(loan.amountPaid)} />
                  <Figure label="Outstanding" value={formatCurrency(loan.outstandingAmount)} />
                </dl>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
