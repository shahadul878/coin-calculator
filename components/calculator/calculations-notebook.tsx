"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Copy, Trash2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Calculation, PaginatedResponse } from "@/types";

export function CalculationsNotebook() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Calculation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) params.set("search", search);

    const res = await fetch(`/api/calculations?${params}`);
    const result = await res.json();
    if (result.success) setData(result.data);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/calculations/${deleteId}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      toast.success("Calculation deleted");
      setDeleteId(null);
      fetchData();
    } else {
      toast.error(result.error ?? "Delete failed");
    }
    setDeleting(false);
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/calculations/${id}/duplicate`, { method: "POST" });
    const result = await res.json();
    if (result.success) {
      toast.success("Calculation duplicated");
      fetchData();
    } else {
      toast.error(result.error ?? "Duplicate failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search calculations..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Link href="/dashboard/calculator">
          <Button>New Calculation</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-slate-100" />
              <CardContent className="h-24 bg-slate-50" />
            </Card>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No calculations yet.{" "}
            <Link href="/dashboard/calculator" className="text-slate-900 underline">
              Create one
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((calc) => (
            <Card key={calc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    {formatCurrency(calc.grand_total)}
                  </CardTitle>
                  <span className="text-xs text-slate-400">
                    {formatDate(calc.created_at)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-slate-600">
                  {calc.coin_quantity} coins × {formatCurrency(calc.price_per_coin)}
                </div>
                {calc.notes && (
                  <p className="text-sm text-slate-500 line-clamp-2">{calc.notes}</p>
                )}
                <div className="flex gap-1 pt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/calculations/${calc.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      router.push(`/dashboard/calculations/${calc.id}?edit=true`)
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(calc.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(calc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete calculation?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
