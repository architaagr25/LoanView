"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { NO_FORM_ERRORS, shouldShowSummary, toFormErrors } from "@/lib/formErrors";
import { homePathForRole, ROUTES } from "@/lib/routes";

export default function SignupPage() {
  const { status, user, modules, signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState(NO_FORM_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(homePathForRole(user.role, modules));
    }
  }, [status, user, modules, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Checked here rather than on the server, because the server never sees the
    // second field — it exists purely to catch a typo before the account is
    // created with a password the user cannot reproduce.
    if (password !== confirmPassword) {
      setErrors({
        message: "",
        fields: { confirmPassword: "Passwords do not match" },
      });
      return;
    }

    setErrors(NO_FORM_ERRORS);
    setSubmitting(true);

    try {
      const payload = await signup(name, email, password);
      router.replace(homePathForRole(payload.user.role, payload.modules));
    } catch (error) {
      setErrors(toFormErrors(error));
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create an account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Apply for a loan in four steps. Staff accounts are created internally.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {shouldShowSummary(errors) && <Alert tone="error">{errors.message}</Alert>}

        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.fields.name}
          placeholder="Rahul Mehta"
        />

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
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.fields.password}
          hint="At least 8 characters"
          placeholder="••••••••"
        />

        <TextField
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.fields.confirmPassword}
          placeholder="••••••••"
        />

        <Button type="submit" loading={submitting} fullWidth>
          {submitting ? "Creating account" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </>
  );
}
