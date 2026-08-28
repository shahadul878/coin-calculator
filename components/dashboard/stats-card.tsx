import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "gold" | "green" | "blue" | "red";
}

const accentStyles = {
  gold: "bg-brand-50 text-brand-600 ring-brand-200/60",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-200/60",
  blue: "bg-blue-50 text-blue-600 ring-blue-200/60",
  red: "bg-red-50 text-red-600 ring-red-200/60",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  accent = "gold",
}: StatsCardProps) {
  return (
    <div className="surface-card-hover group p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105",
            accentStyles[accent]
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
