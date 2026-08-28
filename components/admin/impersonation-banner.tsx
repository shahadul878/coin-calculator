"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ImpersonationMeta } from "@/lib/impersonation";

export function ImpersonationBanner({ meta }: { meta: ImpersonationMeta }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleExit() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate/exit", { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Failed to exit impersonation");
        return;
      }

      toast.success("Returned to your admin account");
      router.push(json.data?.redirect ?? "/dashboard/admin/users");
      router.refresh();
    } catch {
      toast.error("Failed to exit impersonation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="text-sm">
          <p className="font-semibold">Impersonation active</p>
          <p className="text-amber-800">
            Signed in as <span className="font-medium">{meta.target_email}</span>{" "}
            (admin: {meta.admin_email})
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
        onClick={handleExit}
        disabled={loading}
      >
        {loading ? "Exiting…" : "Exit impersonation"}
      </Button>
    </div>
  );
}
