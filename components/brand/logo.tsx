import Link from "next/link";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  showText?: boolean;
}

export function Logo({ className, variant = "dark", showText = true }: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link href="/dashboard" className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl shadow-glow",
          isLight
            ? "bg-gradient-to-br from-brand-400 to-brand-600"
            : "bg-gradient-to-br from-brand-500 to-brand-600"
        )}
      >
        <Coins className="h-5 w-5 text-white" strokeWidth={2.25} />
      </div>
      {showText && (
        <div className="leading-tight">
          <span
            className={cn(
              "block text-base font-bold tracking-tight",
              isLight ? "text-white" : "text-slate-900"
            )}
          >
            Coin Requests
          </span>
          <span
            className={cn(
              "block text-[11px] font-medium uppercase tracking-widest",
              isLight ? "text-slate-400" : "text-slate-400"
            )}
          >
            Management
          </span>
        </div>
      )}
    </Link>
  );
}
