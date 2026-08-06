"use client";

import { useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import { EMPLOYMENT_OPTIONS } from "@/lib/constants";
import { previewEligibility } from "@/lib/eligibility";
import { NO_FORM_ERRORS, shouldShowSummary, toFormErrors } from "@/lib/formErrors";
import { todayAsInputValue } from "@/lib/format";
import type { EmploymentMode, Profile } from "@/lib/types";
import { Alert, ReasonList } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EligibilityChecklist } from "./EligibilityChecklist";

interface DetailsStepProps {
  profile: Profile | null;
  onSaved: () => void;
}

export function DetailsStep({ profile, onSaved }: DetailsStepProps) {
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [pan, setPan] = useState(profile?.pan ?? "");
  // Trimmed to the date portion: the API returns a full timestamp, and a date
  // input only accepts YYYY-MM-DD.
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth?.slice(0, 10) ?? "");
  const [monthlySalary, setMonthlySalary] = useState(
    profile ? String(profile.monthlySalary) : "",
  );
  const [employmentMode, setEmploymentMode] = useState<EmploymentMode | "">(
    profile?.employmentMode ?? "",
  );

  const [errors, setErrors] = useState(NO_FORM_ERRORS);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // The draft is built inside the memo rather than outside it: an object
  // literal is a new value on every render, so depending on one would recompute
  // every time and defeat the point. Recomputes only when an input that feeds a
  // rule changes — not on every keystroke in the name field.
  const rules = useMemo(
    () => previewEligibility({ pan, dateOfBirth, monthlySalary, employmentMode }),
    [pan, dateOfBirth, monthlySalary, employmentMode],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors(NO_FORM_ERRORS);
    setRejectionReasons([]);
    setSubmitting(true);

    try {
      await api.post("/borrower/profile", {
        fullName,
        pan,
        dateOfBirth,
        monthlySalary: Number(monthlySalary),
        employmentMode,
      });

      // Not awaited: the refreshed data arrives through a re-render, and the
      // button stays disabled because this step is about to be replaced.
      onSaved();
    } catch (error) {
      // A policy rejection is not a form error — the form was filled in
      // correctly and the answer is no. It gets its own presentation, listing
      // every rule that failed rather than a single message.
      if (error instanceof ApiError && error.isPolicyRejection) {
        const details = error.details as { reasons?: string[] } | undefined;
        setRejectionReasons(details?.reasons ?? [error.message]);
      } else {
        setErrors(toFormErrors(error));
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader
          title="Personal details"
          description="Used to confirm you are eligible to borrow."
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {shouldShowSummary(errors) && <Alert tone="error">{errors.message}</Alert>}

            {rejectionReasons.length > 0 && (
              <Alert tone="error" title="You are not eligible for a loan">
                <ReasonList reasons={rejectionReasons} />
                <p className="mt-2">Correct the details above and try again.</p>
              </Alert>
            )}

            <TextField
              label="Full name"
              name="fullName"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              error={errors.fields.fullName}
              placeholder="As printed on your PAN card"
            />

            <TextField
              label="PAN"
              name="pan"
              required
              value={pan}
              // Uppercased as it is typed, so the field matches the format the
              // rule describes instead of appearing to fail until submitted.
              onChange={(event) => setPan(event.target.value.toUpperCase())}
              error={errors.fields.pan}
              hint="Ten characters, for example ABCDE1234F"
              placeholder="ABCDE1234F"
              maxLength={10}
              className="font-mono tracking-wider uppercase"
            />

            <TextField
              label="Date of birth"
              name="dateOfBirth"
              type="date"
              required
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              error={errors.fields.dateOfBirth}
              max={todayAsInputValue()}
            />

            <TextField
              label="Monthly salary"
              name="monthlySalary"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              required
              value={monthlySalary}
              onChange={(event) => setMonthlySalary(event.target.value)}
              error={errors.fields.monthlySalary}
              hint="Gross monthly income in rupees"
              placeholder="60000"
            />

            <SelectField
              label="Employment mode"
              name="employmentMode"
              required
              value={employmentMode}
              onChange={(event) => setEmploymentMode(event.target.value as EmploymentMode | "")}
              error={errors.fields.employmentMode}
              options={EMPLOYMENT_OPTIONS}
              placeholder="Select one"
            />

            {/* Never disabled on the strength of the local check. The server
                decides, and a mistake in this copy of the rules must not be
                able to lock someone out of applying. */}
            <Button type="submit" loading={submitting}>
              {submitting ? "Checking eligibility" : "Save and continue"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <EligibilityChecklist rules={rules} />
      </div>
    </div>
  );
}
