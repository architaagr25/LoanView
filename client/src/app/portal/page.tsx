"use client";

import Link from "next/link";
import {
  ArrowRight,
  BanknoteArrowUp,
  CalendarDays,
  ChevronRight,
  Percent,
  UserRound,
  Wallet,
} from "lucide-react";
import { useApplication } from "@/hooks/useApplication";
import { DocumentLink } from "@/components/DocumentLink";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, DetailRow, StatCard } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/ui/Spinner";
import { EMPLOYMENT_OPTIONS } from "@/lib/constants";
import { formatCurrency, formatDate, formatTenure } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import type { Loan, Profile } from "@/lib/types";

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

  const nextStep = !profile
    ? "Start with your personal details"
    : !profile.salarySlip
      ? "Next: upload your salary slip"
      : "Next: choose your loan amount";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Borrower portal"
        title={profile ? `Hello, ${profile.fullName.split(" ")[0]}` : "Your loans"}
        description="Track your application from request through to final repayment."
      />

      {!activeLoan && (
        // The call to action leads the page when there is nothing in progress,
        // because starting or continuing an application is the only thing the
        // borrower can usefully do at that point.
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-brand-600 to-brand-800">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 30rem 20rem at 90% 10%, rgb(6 182 212 / 0.35), transparent)",
            }}
            aria-hidden="true"
          />
          <CardBody className="relative flex flex-wrap items-center justify-between gap-5 py-7">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {loans.length > 0 ? "Apply for another loan" : "Apply for a loan"}
              </h2>
              <p className="mt-1 text-sm text-brand-100">{nextStep}</p>
            </div>
            <Link href={ROUTES.apply}>
              <Button size="lg" variant="secondary">
                {profile ? "Continue application" : "Get started"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {activeLoan && <LoanSummary loan={activeLoan} />}

      {loans.length === 0 ? (
        <Card>
          <EmptyState
            title="No loans yet"
            description="Once you apply, your loan and its progress will appear here."
            icon={<Wallet className="size-6" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {loans.length === 1 ? "Your loan" : "All loans"}
          </h2>
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </section>
      )}

      {profile && <ProfileCard profile={profile} />}
    </div>
  );
}

/** The details the eligibility decision was made on, and the document behind it. */
function ProfileCard({ profile }: { profile: Profile }) {
  const employment =
    EMPLOYMENT_OPTIONS.find((option) => option.value === profile.employmentMode)?.label ??
    profile.employmentMode;

  return (
    <Card>
      <CardHeader
        title="Your details"
        description="Used to assess your eligibility."
        icon={<UserRound className="size-4.5" aria-hidden="true" />}
      />
      <CardBody className="grid gap-6 lg:grid-cols-2">
        <dl>
          <DetailRow label="Full name" value={profile.fullName} />
          <DetailRow
            label="PAN"
            value={<span className="font-mono tracking-wider">{profile.pan}</span>}
          />
          <DetailRow label="Date of birth" value={formatDate(profile.dateOfBirth)} />
          <DetailRow label="Monthly salary" value={formatCurrency(profile.monthlySalary)} />
          <DetailRow label="Employment" value={employment} />
        </dl>

        <div>
          <p className="text-sm font-medium text-slate-700">Salary slip</p>
          <div className="mt-2">
            {profile.salarySlip ? (
              <DocumentLink
                fileId={profile.salarySlip.file}
                name={profile.salarySlip.originalName}
                sizeBytes={profile.salarySlip.sizeBytes}
              />
            ) : (
              <p className="text-sm text-slate-500">Not uploaded yet.</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/** Headline figures for the loan currently in play. */
function LoanSummary({ loan }: { loan: Loan }) {
  const repaidPercent =
    loan.totalRepayment > 0 ? Math.round((loan.amountPaid / loan.totalRepayment) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Loan amount"
        value={formatCurrency(loan.principal)}
        icon={<BanknoteArrowUp className="size-4" aria-hidden="true" />}
        tone="brand"
      />
      <StatCard
        label="Total repayable"
        value={formatCurrency(loan.totalRepayment)}
        hint={`Includes ${formatCurrency(loan.interestAmount)} interest`}
        icon={<Percent className="size-4" aria-hidden="true" />}
      />
      <StatCard
        label="Repaid so far"
        value={formatCurrency(loan.amountPaid)}
        hint={`${repaidPercent}% of the total`}
        icon={<Wallet className="size-4" aria-hidden="true" />}
        tone="success"
      />
      <StatCard
        label="Outstanding"
        value={formatCurrency(loan.outstandingAmount)}
        hint={formatTenure(loan.tenureDays)}
        icon={<CalendarDays className="size-4" aria-hidden="true" />}
        tone={loan.outstandingAmount > 0 ? "warning" : "success"}
      />
    </div>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
  const repaidPercent =
    loan.totalRepayment > 0 ? Math.min(100, (loan.amountPaid / loan.totalRepayment) * 100) : 0;

  return (
    // The whole card is the link, rather than a "view" action tucked in a
    // corner — the card is what someone reaches for.
    <Link href={`/portal/loans/${loan.id}`} className="block">
      <Card interactive>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-semibold tracking-tight text-slate-900 tabular-nums">
                {formatCurrency(loan.principal)}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {formatTenure(loan.tenureDays)} · {loan.interestRate}% p.a. · applied{" "}
                {formatDate(loan.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={loan.status} />
              <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
            </div>
          </div>

          {loan.status === "REJECTED" && loan.rejectionReason && (
            <Alert tone="error" title="Application declined">
              {loan.rejectionReason}
            </Alert>
          )}

          {(loan.status === "DISBURSED" || loan.status === "CLOSED") && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Repayment progress</span>
                <span className="font-medium tabular-nums">{Math.round(repaidPercent)}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
                  style={{ width: `${repaidPercent}%` }}
                />
              </div>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
            <Figure label="Interest" value={formatCurrency(loan.interestAmount)} />
            <Figure label="Total repayable" value={formatCurrency(loan.totalRepayment)} />
            <Figure label="Paid" value={formatCurrency(loan.amountPaid)} />
            <Figure label="Outstanding" value={formatCurrency(loan.outstandingAmount)} />
          </dl>
        </CardBody>
      </Card>
    </Link>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums">{value}</dd>
    </div>
  );
}
