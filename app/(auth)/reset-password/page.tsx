import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password to secure your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
