import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Coin Calculator</h1>
          <p className="text-sm text-slate-500">Digital calculation notebook</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
