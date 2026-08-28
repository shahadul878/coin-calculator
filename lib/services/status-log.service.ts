import { createClient } from "@/lib/supabase/server";
import type { CoinRequestStatusLog, StatusLogType } from "@/types";
import type { StatusChange } from "@/lib/utils/status-log";

function mapStatusLog(row: Record<string, unknown>): CoinRequestStatusLog {
  return {
    id: row.id as string,
    coin_request_id: row.coin_request_id as string,
    user_id: row.user_id as string,
    status_type: row.status_type as StatusLogType,
    old_status: row.old_status as string | null,
    new_status: row.new_status as string,
    created_at: row.created_at as string,
  };
}

export async function logCoinStatusChanges(
  coinRequestId: string,
  userId: string,
  changes: StatusChange[]
): Promise<void> {
  if (changes.length === 0) return;

  const supabase = await createClient();
  const rows = changes.map((change) => ({
    coin_request_id: coinRequestId,
    user_id: userId,
    status_type: change.statusType,
    old_status: change.oldStatus,
    new_status: change.newStatus,
  }));

  const { error } = await supabase.from("coin_request_status_logs").insert(rows);
  if (error) throw error;
}

export async function getCoinRequestStatusLogs(
  coinRequestId: string,
  userId: string,
  options: { adminScope?: boolean } = {}
): Promise<CoinRequestStatusLog[]> {
  const supabase = await createClient();

  let requestQuery = supabase
    .from("coin_requests")
    .select("id")
    .eq("id", coinRequestId);

  if (!options.adminScope) {
    requestQuery = requestQuery.eq("user_id", userId);
  }

  const { data: request } = await requestQuery.maybeSingle();

  if (!request) return [];

  const { data, error } = await supabase
    .from("coin_request_status_logs")
    .select("*")
    .eq("coin_request_id", coinRequestId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapStatusLog);
}
