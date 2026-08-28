import { RegisterForm } from "@/components/forms/register-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Get started"
      subtitle="Create your account and start managing coin requests in minutes."
    >
      <RegisterForm />
    </AuthShell>
  );
}
