import Link from "next/link";
import { Coins, DollarSign, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = await getDashboardStats(user.id);

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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={Coins}
        />
        <StatsCard
          title="Total Coins"
          value={stats.totalCoins.toLocaleString()}
          icon={Coins}
        />
        <StatsCard
          title="Total Paid"
          value={formatCurrency(stats.totalPaid)}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Due"
          value={formatCurrency(stats.totalDue)}
          icon={AlertCircle}
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatsCard title="Send Pending" value={stats.sendPending} icon={Clock} />
        <StatsCard title="Send Done" value={stats.sendDone} icon={CheckCircle} />
        <StatsCard title="Send Cancelled" value={stats.sendCancel} icon={XCircle} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Coin Requests</CardTitle>
          <Link href="/dashboard/coin-requests">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentCoinRequests.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">No coin requests yet.</p>
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
                    <TableCell>{req.coin_amount}</TableCell>
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
