"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";
import { AuthAlert, AuthCard, AuthFooterLinks } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await resetPasswordAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Reset password"
      description="Choose a strong password to secure your account."
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
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">
            New password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="h-11"
            autoComplete="new-password"
          />
          <p className="text-xs text-slate-400">Minimum 6 characters</p>
        </div>
        <Button type="submit" className="h-11 w-full" size="lg" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
