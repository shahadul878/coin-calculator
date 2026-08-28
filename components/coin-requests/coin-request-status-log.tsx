import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { formatStatusLabel } from "@/lib/utils/status-log";
import type { CoinRequestStatusLog } from "@/types";
import { ArrowRight, Clock } from "lucide-react";

interface CoinRequestStatusLogPanelProps {
  logs: CoinRequestStatusLog[];
}

function typeLabel(statusType: CoinRequestStatusLog["status_type"]): string {
  return statusType === "payment" ? "Payment Status" : "Send Status";
}

export function CoinRequestStatusLogPanel({ logs }: CoinRequestStatusLogPanelProps) {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Status Change Log</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">No status changes recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3"
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {typeLabel(log.status_type)}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
                  {log.old_status ? (
                    <>
                      <span className="font-medium">
                        {formatStatusLabel(log.status_type, log.old_status)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </>
                  ) : (
                    <span className="text-slate-500">Set to</span>
                  )}
                  <span className="font-semibold text-slate-900">
                    {formatStatusLabel(log.status_type, log.new_status)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatDate(log.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
