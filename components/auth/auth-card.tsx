import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-premium-lg ring-1 ring-slate-900/[0.03]",
        className
      )}
    >
      <div
        className="h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"
        aria-hidden
      />
      <div className="p-8 sm:p-10">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        </header>
        {children}
        {footer && <div className="mt-8 border-t border-slate-100 pt-6">{footer}</div>}
      </div>
    </div>
  );
}

interface AuthAlertProps {
  variant: "error" | "success";
  children: React.ReactNode;
}

export function AuthAlert({ variant, children }: AuthAlertProps) {
  const styles =
    variant === "error"
      ? "border-red-200/80 bg-red-50 text-red-700"
      : "border-emerald-200/80 bg-emerald-50 text-emerald-700";

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm leading-relaxed",
        styles
      )}
      role="alert"
    >
      {children}
    </div>
  );
}

interface AuthFooterLinkProps {
  children: React.ReactNode;
}

export function AuthFooterLinks({ children }: AuthFooterLinkProps) {
  return (
    <div className="space-y-3 text-center text-sm text-slate-500">{children}</div>
  );
}
