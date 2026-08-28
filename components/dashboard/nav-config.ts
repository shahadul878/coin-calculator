import {
  LayoutDashboard,
  Coins,
  FileText,
  User,
  Settings,
  LogOut,
  Plus,
  type LucideIcon,
} from "lucide-react";

export const dashboardNavItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/coin-requests", label: "Coin Requests", icon: Coins },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export { LogOut, Plus };
