import { cookies } from "next/headers";

import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getImpersonationMeta } from "@/lib/impersonation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const impersonationMeta = getImpersonationMeta(await cookies());

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="relative flex-1 overflow-auto bg-mesh-gradient">
        <div className="w-full p-4 sm:p-6 lg:p-8">
          {impersonationMeta && <ImpersonationBanner meta={impersonationMeta} />}
          {children}
        </div>
      </main>
    </div>
  );
}
