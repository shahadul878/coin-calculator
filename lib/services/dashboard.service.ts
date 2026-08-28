import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, CoinRequest } from "@/types";

function mapCoinRequest(row: Record<string, unknown>): CoinRequest {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    request_id: row.request_id as string,
    who_requested: row.who_requested as string,
    price: parseFloat(row.price as string),
    coin_amount: parseFloat(row.coin_amount as string),
    payment_status: row.payment_status as CoinRequest["payment_status"],
    send_status: (row.send_status as CoinRequest["send_status"]) ?? "pending",
    payment_method: row.payment_method as CoinRequest["payment_method"],
    payment_method_other: row.payment_method_other as string | null,
    txn_id: row.txn_id as string | null,
    notes: row.notes as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: requests, error: reqError } = await supabase
    .from("coin_requests")
    .select("*")
    .eq("user_id", userId);

  if (reqError) throw reqError;

  const allRequests = (requests ?? []).map(mapCoinRequest);

  const totalRequests = allRequests.length;
  const totalCoins = allRequests.reduce((sum, r) => sum + r.coin_amount, 0);
  const totalPaid = allRequests
    .filter((r) => r.payment_status === "paid")
    .reduce((sum, r) => sum + r.price, 0);
  const totalDue = allRequests
    .filter((r) => r.payment_status === "due" || r.payment_status === "partial")
    .reduce((sum, r) => sum + r.price, 0);
  const sendPending = allRequests.filter((r) => r.send_status === "pending").length;
  const sendDone = allRequests.filter((r) => r.send_status === "done").length;
  const sendCancel = allRequests.filter((r) => r.send_status === "cancel").length;

  const { data: recentRequests } = await supabase
    .from("coin_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  return {
    totalRequests,
    totalCoins,
    totalPaid,
    totalDue,
    sendPending,
    sendDone,
    sendCancel,
    recentCoinRequests: (recentRequests ?? []).map(mapCoinRequest),
  };
}
