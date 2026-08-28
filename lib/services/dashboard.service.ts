import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, Calculation, CoinRequest } from "@/types";

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

function mapCalculation(row: Record<string, unknown>): Calculation {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    coin_quantity: parseFloat(row.coin_quantity as string),
    price_per_coin: parseFloat(row.price_per_coin as string),
    discount: parseFloat(row.discount as string),
    additional_charge: parseFloat(row.additional_charge as string),
    subtotal: parseFloat(row.subtotal as string),
    grand_total: parseFloat(row.grand_total as string),
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

  const { data: recentRequests } = await supabase
    .from("coin_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentCalcs } = await supabase
    .from("calculations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalRequests,
    totalCoins,
    totalPaid,
    totalDue,
    recentCoinRequests: (recentRequests ?? []).map(mapCoinRequest),
    recentCalculations: (recentCalcs ?? []).map(mapCalculation),
  };
}
