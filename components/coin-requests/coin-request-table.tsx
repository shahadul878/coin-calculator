"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Copy, Trash2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "./status-badge";
import { SendStatusBadge } from "./send-status-badge";
import { formatPaymentMethod } from "./payment-method-select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatCoinAmount, formatPricePerLac } from "@/lib/utils/coin-amount";
import type { CoinRequest, PaginatedResponse } from "@/types";

export function CoinRequestTable() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<CoinRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
    });
    if (search) params.set("search", search);
    if (paymentStatus) params.set("payment_status", paymentStatus);
    if (sendStatus) params.set("send_status", sendStatus);
    if (paymentMethod) params.set("payment_method", paymentMethod);

    const res = await fetch(`/api/coin-requests?${params}`);
    const result = await res.json();
    if (result.success) setData(result.data);
    setLoading(false);
  }, [page, search, paymentStatus, sendStatus, paymentMethod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/coin-requests/${deleteId}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      toast.success("Request deleted");
      setDeleteId(null);
      fetchData();
    } else {
      toast.error(result.error ?? "Delete failed");
    }
    setDeleting(false);
  }

  function handleDuplicate(id: string) {
    router.push(`/dashboard/coin-requests/new?duplicateFrom=${id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search requests..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={paymentStatus}
            onValueChange={(v) => {
              setPaymentStatus(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="due">Due</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sendStatus}
            onValueChange={(v) => {
              setSendStatus(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Send Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Send</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={paymentMethod}
            onValueChange={(v) => {
              setPaymentMethod(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="bkash">Bkash</SelectItem>
              <SelectItem value="nagad">Nagad</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/dashboard/coin-requests/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Coin Request
          </Button>
        </Link>
      </div>

      <div className="surface-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Who Requested</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Coins</TableHead>
              <TableHead>Price/lac</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Send</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Txn ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-slate-500">
                  No coin requests found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">
                    {req.request_id}
                  </TableCell>
                  <TableCell>{req.who_requested}</TableCell>
                  <TableCell>{formatCurrency(req.price)}</TableCell>
                  <TableCell>{formatCoinAmount(req.coin_amount)}</TableCell>
                  <TableCell>{formatPricePerLac(req.price, req.coin_amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={req.payment_status} />
                  </TableCell>
                  <TableCell>
                    <SendStatusBadge status={req.send_status} />
                  </TableCell>
                  <TableCell>
                    {formatPaymentMethod(req.payment_method, req.payment_method_other)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {req.txn_id ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {formatDate(req.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/coin-requests/${req.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/dashboard/coin-requests/${req.id}?edit=true`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(req.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(req.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {data.page} of {data.totalPages} ({data.total} total)
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
            <DialogTitle>Delete coin request?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The request will be permanently deleted.
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
