"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { DemoCredentials } from "@/components/DemoCredentials";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { NO_FORM_ERRORS, shouldShowSummary, toFormErrors } from "@/lib/formErrors";
import { homePathForRole, ROUTES } from "@/lib/routes";

export default function LoginPage() {
  const { status, user, modules, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(NO_FORM_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  // Someone who is already signed in has no business on this screen.
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(homePathForRole(user.role, modules));
    }
  }, [status, user, modules, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors(NO_FORM_ERRORS);
    setSubmitting(true);

    try {
      const payload = await login(email, password);
      router.replace(homePathForRole(payload.user.role, payload.modules));
    } catch (error) {
      setErrors(toFormErrors(error));
      // Only released on failure. On success the redirect is already under way,
      // and re-enabling the button would invite a second submission.
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">
        Borrowers and internal staff sign in here.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {shouldShowSummary(errors) && <Alert tone="error">{errors.message}</Alert>}

        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.fields.email}
          placeholder="you@example.com"
        />

        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.fields.password}
          placeholder="••••••••"
        />

        <Button type="submit" loading={submitting} fullWidth>
          {submitting ? "Signing in" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        New here?{" "}
        <Link href={ROUTES.signup} className="font-medium text-brand-600 hover:text-brand-700">
          Create a borrower account
        </Link>
      </p>

      <DemoCredentials
        onSelect={(demoEmail, demoPassword) => {
          setEmail(demoEmail);
          setPassword(demoPassword);
          setErrors(NO_FORM_ERRORS);
        }}
      />
    </>
  );
}
