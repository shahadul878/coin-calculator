import { LoginForm } from "@/components/forms/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your coin requests, track payments, and generate reports."
    >
      <LoginForm />
    </AuthShell>
  );
}
