import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatCurrency } from "@/lib/utils";
import { formatCoinAmount } from "@/lib/utils/coin-amount";
import type { DashboardStats } from "@/types";
import {
  Coins,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface DashboardSummaryProps {
  stats: DashboardStats;
}

function SummaryRow({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50/80 px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-slate-600">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </span>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardSummary({ stats }: DashboardSummaryProps) {
  return (
    <div className="mb-8 space-y-6">
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Requests"
            value={stats.totalRequests}
            icon={FileText}
            accent="blue"
          />
          <StatsCard
            title="Total Coins"
            value={formatCoinAmount(stats.totalCoins)}
            icon={Coins}
            accent="gold"
          />
          <StatsCard
            title="Total Price"
            value={formatCurrency(stats.totalPrice)}
            icon={DollarSign}
            accent="green"
          />
          <StatsCard
            title="Outstanding"
            value={formatCurrency(stats.totalDue)}
            icon={AlertCircle}
            accent="red"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SummaryRow
              label="Paid"
              value={`${stats.paidCount} requests`}
              sub={formatCurrency(stats.totalPaid)}
            />
            <SummaryRow label="Due" value={`${stats.dueCount} requests`} />
            <SummaryRow label="Partial" value={`${stats.partialCount} requests`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">
              Send Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SummaryRow
              label="Pending"
              value={stats.sendPending}
              icon={Clock}
            />
            <SummaryRow label="Done" value={stats.sendDone} icon={CheckCircle} />
            <SummaryRow
              label="Cancelled"
              value={stats.sendCancel}
              icon={XCircle}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
