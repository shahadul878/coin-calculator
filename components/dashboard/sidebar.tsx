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
} from "lucide-react";
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
          Coin Calculator
        </Link>
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
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
  );
}
