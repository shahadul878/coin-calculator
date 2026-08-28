"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { dashboardNavItems, LogOut, Plus } from "./nav-config";

export function MobileDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-[280px] flex-col bg-navy-900 shadow-premium-lg">
            <div className="flex h-[72px] items-center justify-between border-b border-white/[0.08] px-5">
              <Logo variant="light" showText={false} />
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {dashboardNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/20"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="space-y-2 border-t border-white/[0.08] p-4">
              <Link href="/dashboard/coin-requests/new" onClick={() => setOpen(false)}>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  New Request
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                  type="submit"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
