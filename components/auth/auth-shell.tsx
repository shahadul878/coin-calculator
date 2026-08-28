import { Logo } from "@/components/brand/logo";
import { BarChart3, CreditCard, Shield } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const features = [
  {
    icon: CreditCard,
    label: "Track payments & send status",
    description: "Monitor every request from payment to delivery",
  },
  {
    icon: BarChart3,
    label: "Generate filtered reports",
    description: "Export insights by date, status, and amount",
  },
  {
    icon: Shield,
    label: "Secure cloud-backed storage",
    description: "Your data protected with enterprise-grade security",
  },
] as const;

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Background layers */}
      <div className="fixed inset-0 bg-auth-gradient" aria-hidden />
      <div className="fixed inset-0 bg-mesh-gradient opacity-60" aria-hidden />
      <div className="fixed inset-0 bg-dot-pattern opacity-40" aria-hidden />
      <div
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(245,158,11,0.14),transparent_45%)]"
        aria-hidden
      />
      <div
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(245,158,11,0.08),transparent_40%)]"
        aria-hidden
      />

      {/* Left panel — brand & value prop */}
      <div className="relative hidden w-full flex-col justify-between border-r border-white/[0.06] p-10 xl:w-[52%] xl:p-14 lg:flex">
        <Logo variant="light" />

        <div className="max-w-lg space-y-10">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400/90">
              Coin request management
            </p>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
              {title}
            </h1>
            <p className="text-base leading-relaxed text-slate-400">{subtitle}</p>
          </div>

          <ul className="space-y-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.label}
                  className="group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm transition-colors hover:border-brand-500/20 hover:bg-white/[0.05]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-600/10 ring-1 ring-brand-500/20">
                    <Icon className="h-5 w-5 text-brand-400" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-slate-200">
                      {feature.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-xs text-slate-600">
          Trusted by teams managing high-volume coin operations
        </p>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="mb-8 w-full max-w-[440px] text-center lg:hidden">
          <Logo variant="light" className="justify-center" />
          <p className="mt-6 text-sm leading-relaxed text-slate-400">{subtitle}</p>
        </div>

        <div className="w-full max-w-[440px] animate-auth-fade-in">{children}</div>

        <p className="mt-8 text-center text-xs text-slate-500 lg:hidden">
          Professional coin request management
        </p>
      </div>
    </div>
  );
}
