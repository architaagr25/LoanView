"use client";

import Link from "next/link";
import { ArrowRight, BanknoteArrowUp, Send, Users, Wallet } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/EmptyState";
import { MODULE_DESCRIPTION, MODULE_LABEL } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import type { DashboardModule } from "@/lib/types";

const MODULE_ICON: Record<DashboardModule, typeof Users> = {
  sales: Users,
  sanction: BanknoteArrowUp,
  disbursement: Send,
  collection: Wallet,
};

const MODULE_TONE: Record<DashboardModule, string> = {
  sales: "from-sky-500 to-sky-600",
  sanction: "from-amber-500 to-amber-600",
  disbursement: "from-violet-500 to-violet-600",
  collection: "from-emerald-500 to-emerald-600",
};

/**
 * Landing screen for an account with more than one module — in practice, the
 * administrator. Executives are routed straight to their own module, so they
 * never see a page whose only purpose is to offer a single choice.
 */
export default function DashboardPage() {
  const { user, modules } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title={`Welcome back, ${firstName}`}
        description="Each module handles one stage of the loan lifecycle."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((module, index) => {
          const Icon = MODULE_ICON[module];

          return (
            <Link key={module} href={ROUTES.module(module)} className="group">
              <Card interactive className="h-full">
                <CardBody className="flex h-full items-start gap-4">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${MODULE_TONE[module]} text-white shadow-card`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-slate-900">{MODULE_LABEL[module]}</h2>
                      <span className="text-[0.7rem] font-medium text-slate-400 tabular-nums">
                        Stage {index + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{MODULE_DESCRIPTION[module]}</p>
                  </div>
                  <ArrowRight
                    className="mt-1 size-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-500"
                    aria-hidden="true"
                  />
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
