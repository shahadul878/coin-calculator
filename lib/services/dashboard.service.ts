import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, CoinRequest } from "@/types";

const DASHBOARD_COLUMNS =
  "id, request_id, who_requested, price, coin_amount, payment_status, send_status, created_at";

type DashboardRow = Pick<
  CoinRequest,
  | "id"
  | "request_id"
  | "who_requested"
  | "price"
  | "coin_amount"
  | "payment_status"
  | "send_status"
  | "created_at"
>;

function mapDashboardRow(row: Record<string, unknown>): DashboardRow {
  return {
    id: row.id as string,
    request_id: row.request_id as string,
    who_requested: row.who_requested as string,
    price: parseFloat(row.price as string),
    coin_amount: parseFloat(row.coin_amount as string),
    payment_status: row.payment_status as CoinRequest["payment_status"],
    send_status: (row.send_status as CoinRequest["send_status"]) ?? "pending",
    created_at: row.created_at as string,
  };
}

function toRecentCoinRequest(row: DashboardRow): CoinRequest {
  return {
    ...row,
    user_id: "",
    payment_method: null,
    payment_method_other: null,
    txn_id: null,
    notes: null,
    updated_at: row.created_at,
  };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from("coin_requests")
    .select(DASHBOARD_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (requests ?? []).map(mapDashboardRow);

  let totalCoins = 0;
  let totalPrice = 0;
  let totalPaid = 0;
  let totalDue = 0;
  let paidCount = 0;
  let dueCount = 0;
  let partialCount = 0;
  let sendPending = 0;
  let sendDone = 0;
  let sendCancel = 0;

  for (const row of rows) {
    totalCoins += row.coin_amount;
    totalPrice += row.price;

    if (row.payment_status === "paid") {
      paidCount += 1;
      totalPaid += row.price;
    } else if (row.payment_status === "due") {
      dueCount += 1;
      totalDue += row.price;
    } else if (row.payment_status === "partial") {
      partialCount += 1;
      totalDue += row.price;
    }

    if (row.send_status === "pending") sendPending += 1;
    else if (row.send_status === "done") sendDone += 1;
    else if (row.send_status === "cancel") sendCancel += 1;
  }

  return {
    totalRequests: rows.length,
    totalCoins,
    totalPrice,
    totalPaid,
    totalDue,
    paidCount,
    dueCount,
    partialCount,
    sendPending,
    sendDone,
    sendCancel,
    recentCoinRequests: rows.slice(0, 8).map(toRecentCoinRequest),
  };
}
