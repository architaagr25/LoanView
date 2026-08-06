import { formatCurrency, formatDate, formatTenure } from "@/lib/format";
import { EMPLOYMENT_OPTIONS } from "@/lib/constants";
import type { LoanWithApplicant } from "@/lib/types";
import { DocumentLink } from "@/components/DocumentLink";
import { Timeline } from "@/components/Timeline";
import { DetailRow } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

/**
 * Everything a reviewer needs about one application, in the order they need it.
 *
 * Shared by all three modules that act on a loan. A sanction executive, a
 * disbursement executive and a collection executive are looking at the same
 * record for different reasons, and there is no case for three near-identical
 * layouts of the same fields.
 */
export function ApplicantSummary({ loan }: { loan: LoanWithApplicant }) {
  const employment =
    EMPLOYMENT_OPTIONS.find((option) => option.value === loan.profile.employmentMode)?.label ??
    loan.profile.employmentMode;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(loan.principal)}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatTenure(loan.tenureDays)} at {loan.interestRate}% p.a.
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Applicant
          </h3>
          <dl className="mt-2">
            <DetailRow label="Name" value={loan.profile.fullName} />
            <DetailRow
              label="PAN"
              value={<span className="font-mono tracking-wider">{loan.profile.pan}</span>}
            />
            <DetailRow label="Age" value={`${loan.profile.ageYears} years`} />
            <DetailRow label="Monthly salary" value={formatCurrency(loan.profile.monthlySalary)} />
            <DetailRow label="Employment" value={employment} />
            <DetailRow label="Email" value={loan.borrower.email} />
          </dl>
        </section>

        <section>
          <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Loan terms
          </h3>
          <dl className="mt-2">
            <DetailRow label="Principal" value={formatCurrency(loan.principal)} />
            <DetailRow label="Interest" value={formatCurrency(loan.interestAmount)} />
            <DetailRow label="Total repayable" value={formatCurrency(loan.totalRepayment)} />
            <DetailRow label="Repaid" value={formatCurrency(loan.amountPaid)} />
            <DetailRow label="Outstanding" value={formatCurrency(loan.outstandingAmount)} />
            <DetailRow label="Applied" value={formatDate(loan.createdAt)} />
          </dl>
        </section>
      </div>

      <section>
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Salary slip
        </h3>
        <div className="mt-2">
          {loan.profile.salarySlip ? (
            <DocumentLink
              fileId={loan.profile.salarySlip.file}
              name={loan.profile.salarySlip.originalName}
              sizeBytes={loan.profile.salarySlip.sizeBytes}
            />
          ) : (
            <p className="text-sm text-slate-500">No salary slip on file.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">History</h3>
        <div className="mt-3">
          <Timeline entries={loan.statusHistory} />
        </div>
      </section>
    </div>
  );
}
