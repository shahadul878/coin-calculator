"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { AuthAlert, AuthCard, AuthFooterLinks } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const result = await forgotPasswordAction(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
    setLoading(false);
  }

  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email and we'll send you a secure reset link."
      footer={
        <AuthFooterLinks>
          <Link
            href="/login"
            className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            Back to sign in
          </Link>
        </AuthFooterLinks>
      }
    >
      <form action={handleSubmit} className="space-y-5">
        {error && <AuthAlert variant="error">{error}</AuthAlert>}
        {success && <AuthAlert variant="success">{success}</AuthAlert>}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-11"
            autoComplete="email"
          />
        </div>
        <Button type="submit" className="h-11 w-full" size="lg" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
