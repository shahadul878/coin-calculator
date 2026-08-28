import { Logo } from "@/components/brand/logo";
import { CheckCircle2 } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const features = [
  "Track payments & send status",
  "Generate filtered reports",
  "Secure cloud-backed storage",
];

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen">
      <div className="fixed inset-0 bg-auth-gradient" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.12),transparent_50%)]" />

      <div className="relative hidden w-[45%] flex-col justify-between p-12 lg:flex">
        <Logo variant="light" />
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-3 max-w-sm text-base text-slate-400">{subtitle}</p>
          </div>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">
          Professional coin request management
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <Logo variant="light" className="justify-center" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
