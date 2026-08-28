import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200/60",
        paid: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60",
        due: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/60",
        partial: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/60",
        done: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60",
        pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/60",
        cancel: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/60",
        secondary: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
