"use client";

import { useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusBadge } from "@/components/coin-requests/status-badge";
import { SendStatusBadge } from "@/components/coin-requests/send-status-badge";
import { formatPaymentMethod } from "@/components/coin-requests/payment-method-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatCoinAmount } from "@/lib/utils/coin-amount";
import type { CoinRequestReport } from "@/types";
import { Coins, DollarSign, AlertCircle } from "lucide-react";

function buildQueryParams(filters: {
  dateFrom: string;
  dateTo: string;
  requestId: string;
  whoRequested: string;
}): string {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  if (filters.requestId) params.set("request_id", filters.requestId);
  if (filters.whoRequested) params.set("who_requested", filters.whoRequested);
  return params.toString();
}

export function CoinRequestReportPanel() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [requestId, setRequestId] = useState("");
  const [whoRequested, setWhoRequested] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CoinRequestReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    const query = buildQueryParams({
      dateFrom,
      dateTo,
      requestId,
      whoRequested,
    });

    const res = await fetch(`/api/reports/coin-requests?${query}`);
    const result = await res.json();

    if (result.success) {
      setReport(result.data);
    } else {
      setReport(null);
      setError(result.error ?? "Failed to generate report");
    }

    setLoading(false);
  }

  function handleExport() {
    const query = buildQueryParams({
      dateFrom,
      dateTo,
      requestId,
      whoRequested,
    });
    window.location.href = `/api/reports/coin-requests/export?${query}`;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-id">Request ID</Label>
              <Input
                id="request-id"
                placeholder="e.g. 000001"
                maxLength={6}
                value={requestId}
                onChange={(e) => setRequestId(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="who-requested">Who Requested</Label>
              <Input
                id="who-requested"
                placeholder="Search by name"
                value={whoRequested}
                onChange={(e) => setWhoRequested(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleGenerate} disabled={loading} className="gap-2">
              <Search className="h-4 w-4" />
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={loading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Records"
              value={report.summary.totalRecords}
              icon={FileText}
            />
            <StatsCard
              title="Total Coins"
              value={formatCoinAmount(report.summary.totalCoins)}
              icon={Coins}
            />
            <StatsCard
              title="Total Price"
              value={formatCurrency(report.summary.totalPrice)}
              icon={DollarSign}
            />
            <StatsCard
              title="Due / Partial"
              value={report.summary.dueCount + report.summary.partialCount}
              icon={AlertCircle}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Paid</span>
                  <span className="font-medium">{report.summary.paidCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due</span>
                  <span className="font-medium">{report.summary.dueCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Partial</span>
                  <span className="font-medium">{report.summary.partialCount}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Send Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span className="font-medium">{report.summary.sendPending}</span>
                </div>
                <div className="flex justify-between">
                  <span>Done</span>
                  <span className="font-medium">{report.summary.sendDone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelled</span>
                  <span className="font-medium">{report.summary.sendCancel}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Report Results ({report.rows.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.rows.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No coin requests match your filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Who Requested</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Coins</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Send</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono">{row.request_id}</TableCell>
                          <TableCell>{row.who_requested}</TableCell>
                          <TableCell>{formatCurrency(row.price)}</TableCell>
                          <TableCell>{formatCoinAmount(row.coin_amount)}</TableCell>
                          <TableCell>
                            <StatusBadge status={row.payment_status} />
                          </TableCell>
                          <TableCell>
                            <SendStatusBadge status={row.send_status} />
                          </TableCell>
                          <TableCell>
                            {formatPaymentMethod(
                              row.payment_method,
                              row.payment_method_other
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {formatDate(row.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
