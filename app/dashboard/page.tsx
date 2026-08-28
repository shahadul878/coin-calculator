import Link from "next/link";
import { Coins, Calculator, DollarSign, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusBadge } from "@/components/coin-requests/status-badge";
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
        description="Overview of your coin requests and calculations"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Coin Requests"
          value={stats.totalRequests}
          icon={Coins}
        />
        <StatsCard
          title="Total Coins"
          value={stats.totalCoins.toLocaleString()}
          icon={Calculator}
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Coin Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentCoinRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No coin requests yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Who</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
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
                      <TableCell>
                        <StatusBadge status={req.payment_status} />
                      </TableCell>
                      <TableCell>{formatCurrency(req.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentCalculations.length === 0 ? (
              <p className="text-sm text-slate-500">No calculations yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Total</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentCalculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/calculations/${calc.id}`}
                          className="font-medium hover:underline"
                        >
                          {formatCurrency(calc.grand_total)}
                        </Link>
                      </TableCell>
                      <TableCell>{calc.coin_quantity}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(calc.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
