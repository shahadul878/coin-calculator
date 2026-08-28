"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  BookOpen,
  Coins,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/calculator", label: "Calculator", icon: Calculator },
  { href: "/dashboard/calculations", label: "Calculations", icon: BookOpen },
  { href: "/dashboard/coin-requests", label: "Coin Requests", icon: Coins },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function MobileDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
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
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-lg">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-lg font-semibold">Coin Calculator</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => {
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
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-200 p-4">
              <form action={logoutAction}>
                <Button variant="ghost" className="w-full justify-start gap-3" type="submit">
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
