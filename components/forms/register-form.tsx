"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { AuthAlert, AuthCard, AuthFooterLinks } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await registerAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      description="Set up your profile and start managing coin requests."
      footer={
        <AuthFooterLinks>
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </AuthFooterLinks>
      }
    >
      <form action={handleSubmit} className="space-y-5">
        {error && <AuthAlert variant="error">{error}</AuthAlert>}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-slate-700">
            Full name
          </Label>
          <Input
            id="full_name"
            name="full_name"
            required
            placeholder="John Doe"
            className="h-11"
            autoComplete="name"
          />
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">
            Password
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
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
