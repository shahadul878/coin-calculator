"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateRangeLabel } from "@/lib/utils/date-range";

export function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";
  const activeRange = formatDateRangeLabel(dateFrom || undefined, dateTo || undefined);

  function applyFilter(from: string, to: string) {
    const params = new URLSearchParams();
    if (from) params.set("date_from", from);
    if (to) params.set("date_to", to);
    const query = params.toString();
    router.push(query ? `/dashboard?${query}` : "/dashboard");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    applyFilter(
      String(formData.get("date_from") ?? ""),
      String(formData.get("date_to") ?? "")
    );
  }

  function clearFilter() {
    router.push("/dashboard");
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dashboard-date-from">Date From</Label>
                <Input
                  id="dashboard-date-from"
                  name="date_from"
                  type="date"
                  defaultValue={dateFrom}
                  key={`from-${dateFrom}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboard-date-to">Date To</Label>
                <Input
                  id="dashboard-date-to"
                  name="date_to"
                  type="date"
                  defaultValue={dateTo}
                  key={`to-${dateTo}`}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gap-2">
                <Calendar className="h-4 w-4" />
                Apply
              </Button>
              {(dateFrom || dateTo) && (
                <Button type="button" variant="outline" onClick={clearFilter} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {activeRange && (
            <p className="text-sm text-slate-500">
              Showing results for{" "}
              <span className="font-medium text-slate-700">{activeRange}</span>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
