import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { DashboardDateFilter } from "@/components/dashboard/dashboard-date-filter";
import { StatusBadge } from "@/components/coin-requests/status-badge";
import { SendStatusBadge } from "@/components/coin-requests/send-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/permissions";
import { getDashboardStats } from "@/lib/services/dashboard.service";
import { dashboardDateFilterSchema } from "@/lib/validations/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatCoinAmount } from "@/lib/utils/coin-amount";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ date_from?: string; date_to?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const parsed = dashboardDateFilterSchema.safeParse({
    date_from: params.date_from,
    date_to: params.date_to,
  });

  const dateFrom = parsed.success ? parsed.data.date_from : undefined;
  const dateTo = parsed.success ? parsed.data.date_to : undefined;

  const stats = await getDashboardStats(user.id, { dateFrom, dateTo });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your coin requests"
        action={
          <Link href="/dashboard/coin-requests/new">
            <Button>New Coin Request</Button>
          </Link>
        }
      />

      <Suspense fallback={null}>
        <DashboardDateFilter />
      </Suspense>

      <DashboardSummary stats={stats} />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-semibold">Recent Coin Requests</CardTitle>
          <Link href="/dashboard/coin-requests">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentCoinRequests.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">
                {dateFrom || dateTo
                  ? "No coin requests found for the selected dates."
                  : "No coin requests yet."}
              </p>
              <Link href="/dashboard/coin-requests/new">
                <Button className="mt-4" size="sm">
                  Create First Request
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Who Requested</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Send</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentCoinRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/coin-requests/${req.id}`}
                        className="font-mono text-sm hover:underline"
                      >
                        {req.request_id}
                      </Link>
                    </TableCell>
                    <TableCell>{req.who_requested}</TableCell>
                    <TableCell>{formatCoinAmount(req.coin_amount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={req.payment_status} />
                    </TableCell>
                    <TableCell>
                      <SendStatusBadge status={req.send_status} />
                    </TableCell>
                    <TableCell>{formatCurrency(req.price)}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(req.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
