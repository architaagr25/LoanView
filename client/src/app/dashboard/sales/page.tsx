"use client";

import { CheckCircle2, FileText, UserPlus, Users } from "lucide-react";
import { useQueue } from "@/hooks/useQueue";
import { QueueShell } from "@/components/dashboard/QueueShell";
import { StageBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/EmptyState";
import { TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/Table";
import { EMPLOYMENT_OPTIONS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Lead, LeadSummary } from "@/lib/types";

interface LeadsResponse {
  leads: Lead[];
  summary: LeadSummary;
}

export default function SalesModulePage() {
  const { data, loading, error } = useQueue<LeadsResponse>("/sales/leads");

  const leads = data?.leads ?? [];
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations · Sales"
        title="Leads"
        description="Borrowers who have registered but not yet submitted an application."
      />

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Registered"
            value={summary.registered}
            hint="Signed up, nothing entered"
            icon={<UserPlus className="size-4" aria-hidden="true" />}
          />
          <StatCard
            label="Details submitted"
            value={summary.detailsSubmitted}
            hint="Passed eligibility"
            icon={<Users className="size-4" aria-hidden="true" />}
            tone="brand"
          />
          <StatCard
            label="Documents uploaded"
            value={summary.documentsUploaded}
            hint="Ready to apply"
            icon={<FileText className="size-4" aria-hidden="true" />}
            tone="warning"
          />
          <StatCard
            label="Converted"
            value={summary.converted}
            hint="Have applied for a loan"
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            tone="success"
          />
        </div>
      )}

      <QueueShell
        loading={loading}
        error={error}
        isEmpty={leads.length === 0}
        empty={
          <EmptyState
            title="No open leads"
            description="Every registered borrower has submitted an application."
            icon={<Users className="size-6" aria-hidden="true" />}
          />
        }
      >
        <TableWrap>
          <THead>
            <tr>
              <TH>Borrower</TH>
              <TH>Stage</TH>
              <TH>Monthly salary</TH>
              <TH>Employment</TH>
              <TH>Registered</TH>
            </tr>
          </THead>
          <TBody>
            {leads.map((lead) => (
              <TR key={lead.id}>
                <TD>
                  <p className="font-medium text-slate-900">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.email}</p>
                </TD>
                <TD>
                  <StageBadge stage={lead.stage} />
                </TD>
                {/* A dash rather than a blank cell: empty reads as data that
                    failed to load, a dash reads as data not yet provided. */}
                <TD className="tabular-nums">
                  {lead.monthlySalary === null ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    formatCurrency(lead.monthlySalary)
                  )}
                </TD>
                <TD>
                  {lead.employmentMode === null ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    (EMPLOYMENT_OPTIONS.find((option) => option.value === lead.employmentMode)
                      ?.label ?? lead.employmentMode)
                  )}
                </TD>
                <TD className="whitespace-nowrap">{formatDate(lead.registeredAt)}</TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
      </QueueShell>
    </div>
  );
}
