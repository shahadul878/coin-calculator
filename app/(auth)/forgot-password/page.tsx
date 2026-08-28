import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send you a secure link to reset your password and get back in."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
