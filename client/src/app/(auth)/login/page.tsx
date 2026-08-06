"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
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

  // Someone already signed in has no business on this screen.
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
      // Released only on failure. On success a redirect is already under way,
      // and re-enabling the button would invite a second submission.
      setSubmitting(false);
    }
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-slate-500">Sign in to continue to your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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
          icon={<Mail className="size-4" aria-hidden="true" />}
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
          icon={<Lock className="size-4" aria-hidden="true" />}
        />

        <Button type="submit" size="lg" loading={submitting} fullWidth>
          {submitting ? "Signing in" : "Sign in"}
          {!submitting && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to LoanView?{" "}
        <Link
          href={ROUTES.signup}
          className="font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
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
