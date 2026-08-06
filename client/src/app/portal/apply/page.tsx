"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { DetailsStep } from "@/components/portal/DetailsStep";
import { LoanConfigStep } from "@/components/portal/LoanConfigStep";
import { UploadStep } from "@/components/portal/UploadStep";
import { Stepper, type Step } from "@/components/portal/Stepper";
import { Alert } from "@/components/ui/Alert";
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
        <UploadStep
          profile={profile}
          onUploaded={handleStepSaved}
          onBack={() => setSelectedStep(1)}
          onContinue={() => setSelectedStep(3)}
        />
      )}

      {currentStep === 3 && (
        <LoanConfigStep
          // The application is submitted, so the borrower belongs on the status
          // screen rather than back in a wizard they can no longer use.
          onApplied={() => router.replace(ROUTES.portal)}
          onBack={() => setSelectedStep(2)}
        />
      )}
    </div>
  );
}
