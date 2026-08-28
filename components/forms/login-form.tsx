"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { AuthAlert, AuthCard, AuthFooterLinks } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      description="Enter your credentials to access your dashboard."
      footer={
        <AuthFooterLinks>
          <Link
            href="/forgot-password"
            className="block font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            Forgot password?
          </Link>
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Register
            </Link>
          </p>
        </AuthFooterLinks>
      }
    >
      <form action={handleSubmit} className="space-y-5">
        {error && <AuthAlert variant="error">{error}</AuthAlert>}
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
            className="h-11"
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="h-11 w-full" size="lg" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
