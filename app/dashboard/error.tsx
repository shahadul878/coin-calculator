"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-500">
        An error occurred while loading this page.
      </p>
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
