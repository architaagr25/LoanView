"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { DetailsStep } from "@/components/portal/DetailsStep";
import { Stepper, type Step } from "@/components/portal/Stepper";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/Spinner";
import { ROUTES } from "@/lib/routes";

const STEPS: Step[] = [
  { id: 1, title: "Your details" },
  { id: 2, title: "Salary slip" },
  { id: 3, title: "Loan amount" },
];

export default function ApplyPage() {
  const { profile, activeLoan, loading, error, reload } = useApplication();
  const router = useRouter();

  // Set when the borrower goes back to revisit a completed step, so their
  // choice wins over the position their data implies.
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // A borrower with a live application cannot start another, and the server
  // refuses the request anyway — so send them to the status screen instead of
  // letting them fill in a form that cannot be submitted.
  useEffect(() => {
    if (!loading && activeLoan) {
      router.replace(ROUTES.portal);
    }
  }, [loading, activeLoan, router]);

  if (loading) {
    return <LoadingBlock label="Loading your application" />;
  }

  if (error) {
    return (
      <Alert tone="error" title="Could not load your application">
        {error}
      </Alert>
    );
  }

  if (activeLoan) {
    return <LoadingBlock label="Redirecting" />;
  }

  /**
   * Which step to show is derived from what has actually been saved, not from
   * counting clicks. Reloading the page, or returning tomorrow, resumes exactly
   * where the data says the borrower left off.
   */
  const derivedStep = !profile ? 1 : !profile.salarySlip ? 2 : 3;
  const currentStep = selectedStep ?? derivedStep;

  const completed: number[] = [];
  if (profile) completed.push(1);
  if (profile?.salarySlip) completed.push(2);

  function handleStepSaved() {
    // Clearing the override lets the derived step take over again, so saving
    // advances to whatever comes next.
    setSelectedStep(null);
    reload();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="New application"
        title="Apply for a loan"
        description="Three short steps. Your progress is saved as you go."
      />

      <Stepper steps={STEPS} current={currentStep} completed={completed} onSelect={setSelectedStep} />

      {currentStep === 1 && <DetailsStep profile={profile} onSaved={handleStepSaved} />}

      {currentStep === 2 && (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Salary slip upload — added in the next step.</p>
          </CardBody>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Loan configuration — added in the next step.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
