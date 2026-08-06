"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BanknoteArrowUp,
  CalendarDays,
  History,
  Receipt,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatTenure } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import type { Loan, Payment } from "@/lib/types";
import { Timeline } from "@/components/Timeline";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, DetailRow, StatCard } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/Spinner";
import { TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/Table";

export default function LoanDetailPage(props: PageProps<"/portal/loans/[id]">) {
  // Route parameters arrive as a promise in this version of the framework, so
  // they are unwrapped rather than read directly.
  const { id } = use(props.params);

  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const data = await api.get<{ loan: Loan; payments: Payment[] }>(
          `/borrower/loans/${id}`,
        );
        if (cancelled) return;
        setLoan(data.loan);
        setPayments(data.payments);
        setError(null);
      } catch (caught) {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "Could not load this loan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingBlock label="Loading your loan" />;

  if (error || !loan) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Alert tone="error" title="Loan not found">
          {error ?? "This loan does not exist, or it is not yours."}
        </Alert>
      </div>
    );
  }

  const repaidPercent =
    loan.totalRepayment > 0 ? Math.min(100, (loan.amountPaid / loan.totalRepayment) * 100) : 0;

  return (
    <div className="space-y-6">
      <BackLink />

      <PageHeader
        eyebrow={`Applied ${formatDate(loan.createdAt)}`}
        title={formatCurrency(loan.principal)}
        description={`${formatTenure(loan.tenureDays)} at ${loan.interestRate}% per annum`}
        action={<StatusBadge status={loan.status} />}
      />

      {loan.status === "REJECTED" && loan.rejectionReason && (
        <Alert tone="error" title="Application declined">
          {loan.rejectionReason}
        </Alert>
      )}

      {loan.status === "CLOSED" && (
        <Alert tone="success" title="Loan closed">
          This loan has been repaid in full. Nothing further is owed.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Principal"
          value={formatCurrency(loan.principal)}
          icon={<BanknoteArrowUp className="size-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Total repayable"
          value={formatCurrency(loan.totalRepayment)}
          hint={`Includes ${formatCurrency(loan.interestAmount)} interest`}
          icon={<Receipt className="size-4" aria-hidden="true" />}
        />
        <StatCard
          label="Repaid"
          value={formatCurrency(loan.amountPaid)}
          hint={`${Math.round(repaidPercent)}% of the total`}
          icon={<Wallet className="size-4" aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(loan.outstandingAmount)}
          icon={<CalendarDays className="size-4" aria-hidden="true" />}
          tone={loan.outstandingAmount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* min-w-0 because a grid item will not shrink below its content by
            default, and the table below sets a minimum width — without this the
            column keeps that width on a phone and drags the page sideways. */}
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              title="Repayments"
              description={
                payments.length > 0
                  ? `${payments.length} payment${payments.length === 1 ? "" : "s"} recorded`
                  : undefined
              }
              icon={<Receipt className="size-4.5" aria-hidden="true" />}
            />
            {payments.length === 0 ? (
              <EmptyState
                title="No repayments yet"
                description={
                  loan.status === "DISBURSED"
                    ? "Payments appear here once our collection team records them."
                    : "Repayments begin after the loan is disbursed."
                }
                icon={<Receipt className="size-6" aria-hidden="true" />}
              />
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
                  {payments.map((payment) => (
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
          </Card>

          <Card>
            <CardHeader
              title="Loan terms"
              icon={<BanknoteArrowUp className="size-4.5" aria-hidden="true" />}
            />
            <CardBody>
              <dl>
                <DetailRow label="Principal" value={formatCurrency(loan.principal)} />
                <DetailRow label="Tenure" value={formatTenure(loan.tenureDays)} />
                <DetailRow label="Interest rate" value={`${loan.interestRate}% per annum`} />
                <DetailRow label="Interest" value={formatCurrency(loan.interestAmount)} />
                <DetailRow label="Total repayable" value={formatCurrency(loan.totalRepayment)} />
                {loan.disbursedAt && (
                  <DetailRow label="Disbursed on" value={formatDate(loan.disbursedAt)} />
                )}
                {loan.closedAt && <DetailRow label="Closed on" value={formatDate(loan.closedAt)} />}
              </dl>
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Progress" icon={<History className="size-4.5" aria-hidden="true" />} />
            <CardBody>
              <Timeline entries={loan.statusHistory} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href={ROUTES.portal}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to your loans
    </Link>
  );
}
