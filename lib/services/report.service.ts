import { createClient } from "@/lib/supabase/server";
import type { CoinRequest, CoinRequestReport, CoinRequestReportSummary } from "@/types";

export interface ReportFilters {
  userId: string;
  adminScope?: boolean;
  dateFrom?: string;
  dateTo?: string;
  requestId?: string;
  whoRequested?: string;
}

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

function toStartOfDay(date: string): string {
  return `${date}T00:00:00.000Z`;
}

function toEndOfDay(date: string): string {
  return `${date}T23:59:59.999Z`;
}

function buildSummary(rows: CoinRequest[]): CoinRequestReportSummary {
  return {
    totalRecords: rows.length,
    totalCoins: rows.reduce((sum, row) => sum + row.coin_amount, 0),
    totalPrice: rows.reduce((sum, row) => sum + row.price, 0),
    paidCount: rows.filter((row) => row.payment_status === "paid").length,
    dueCount: rows.filter((row) => row.payment_status === "due").length,
    partialCount: rows.filter((row) => row.payment_status === "partial").length,
    sendPending: rows.filter((row) => row.send_status === "pending").length,
    sendDone: rows.filter((row) => row.send_status === "done").length,
    sendCancel: rows.filter((row) => row.send_status === "cancel").length,
  };
}

export async function generateCoinRequestReport(
  filters: ReportFilters
): Promise<CoinRequestReport> {
  const supabase = await createClient();

  let query = supabase.from("coin_requests").select("*").order("created_at", {
    ascending: false,
  });

  if (!filters.adminScope) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", toStartOfDay(filters.dateFrom));
  }

  if (filters.dateTo) {
    query = query.lte("created_at", toEndOfDay(filters.dateTo));
  }

  if (filters.requestId) {
    const paddedId = filters.requestId.padStart(6, "0");
    query = query.ilike("request_id", `%${paddedId}%`);
  }

  if (filters.whoRequested) {
    query = query.ilike("who_requested", `%${filters.whoRequested}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  const rows = (data ?? []).map(mapCoinRequest);

  return {
    rows,
    summary: buildSummary(rows),
    filters: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      requestId: filters.requestId,
      whoRequested: filters.whoRequested,
    },
  };
}
