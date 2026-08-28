import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";
import { getCoinRequest, getCoinRequestStatusLogs } from "@/lib/services/coin-request.service";
import { PageHeader } from "@/components/dashboard/page-header";
import { CoinRequestForm } from "@/components/coin-requests/coin-request-form";
import { CoinRequestStatusLogPanel } from "@/components/coin-requests/coin-request-status-log";
import { StatusBadge } from "@/components/coin-requests/status-badge";
import { SendStatusBadge } from "@/components/coin-requests/send-status-badge";
import { formatPaymentMethod } from "@/components/coin-requests/payment-method-select";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatCoinAmount } from "@/lib/utils/coin-amount";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function CoinRequestDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { edit } = await searchParams;
  const request = await getCoinRequest(id, user.id);

  if (!request) notFound();

  const statusLogs = await getCoinRequestStatusLogs(id, user.id);

  if (edit === "true") {
    return (
      <div>
        <PageHeader title="Edit Coin Request" />
        <Card className="max-w-3xl">
          <CardContent className="pt-6">
            <CoinRequestForm initialData={request} mode="edit" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Request #${request.request_id}`} />
      <Card className="max-w-lg">
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Who Requested</span>
            <span>{request.who_requested}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Price</span>
            <span>{formatCurrency(request.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Coins</span>
            <span>{formatCoinAmount(request.coin_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Status</span>
            <StatusBadge status={request.payment_status} />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Coin Send Status</span>
            <SendStatusBadge status={request.send_status} />
          </div>
          {request.payment_method && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span>
                  {formatPaymentMethod(
                    request.payment_method,
                    request.payment_method_other
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-sm">{request.txn_id}</span>
              </div>
            </>
          )}
          {request.notes && (
            <div>
              <span className="text-slate-500">Notes</span>
              <p className="mt-1">{request.notes}</p>
            </div>
          )}
          <div className="text-sm text-slate-400">
            Created {formatDate(request.created_at)}
          </div>
        </CardContent>
      </Card>
      <CoinRequestStatusLogPanel logs={statusLogs} />
    </div>
  );
}
