import { createClient } from "@/lib/supabase/server";
import { normalizePaymentFields } from "@/lib/validations";
import { logAudit } from "./audit.service";
import {
  getCoinRequestStatusLogs,
  logCoinStatusChanges,
} from "./status-log.service";
import { collectStatusChanges } from "@/lib/utils/status-log";
import type { CoinRequest, PaginatedResponse, PaymentMethod } from "@/types";
import type { CoinRequestInput } from "@/lib/validations";

interface ListParams {
  userId: string;
  adminScope?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: string;
  sendStatus?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

interface AccessOptions {
  adminScope?: boolean;
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
    payment_method: row.payment_method as PaymentMethod | null,
    payment_method_other: row.payment_method_other as string | null,
    txn_id: row.txn_id as string | null,
    notes: row.notes as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function listCoinRequests(
  params: ListParams
): Promise<PaginatedResponse<CoinRequest>> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  let query = supabase.from("coin_requests").select("*", { count: "exact" });

  if (!params.adminScope) {
    query = query.eq("user_id", params.userId);
  }

  if (params.search) {
    query = query.or(
      `who_requested.ilike.%${params.search}%,request_id.ilike.%${params.search}%,txn_id.ilike.%${params.search}%`
    );
  }

  if (params.paymentStatus) {
    query = query.eq("payment_status", params.paymentStatus);
  }

  if (params.sendStatus) {
    query = query.eq("send_status", params.sendStatus);
  }

  if (params.paymentMethod) {
    query = query.eq("payment_method", params.paymentMethod);
  }

  if (params.dateFrom) {
    query = query.gte("created_at", params.dateFrom);
  }
  if (params.dateTo) {
    query = query.lte("created_at", params.dateTo);
  }

  const sortBy = params.sortBy ?? "created_at";
  const sortOrder = params.sortOrder ?? "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []).map(mapCoinRequest),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCoinRequest(
  id: string,
  userId: string,
  options: AccessOptions = {}
): Promise<CoinRequest | null> {
  const supabase = await createClient();
  let query = supabase.from("coin_requests").select("*").eq("id", id);

  if (!options.adminScope) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  if (error) return null;
  return mapCoinRequest(data);
}

export async function createCoinRequest(
  userId: string,
  input: CoinRequestInput
): Promise<CoinRequest> {
  const supabase = await createClient();
  const paymentFields = normalizePaymentFields(input);

  const { data: existing } = await supabase
    .from("coin_requests")
    .select("id")
    .eq("user_id", userId)
    .eq("request_id", input.request_id)
    .maybeSingle();

  if (existing) {
    throw new Error("DUPLICATE_REQUEST_ID");
  }

  const { data, error } = await supabase
    .from("coin_requests")
    .insert({
      user_id: userId,
      request_id: input.request_id,
      who_requested: input.who_requested,
      price: input.price,
      coin_amount: input.coin_amount,
      payment_status: input.payment_status,
      send_status: input.send_status ?? "pending",
      ...paymentFields,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  const statusChanges = collectStatusChanges(
    { payment_status: input.payment_status, send_status: input.send_status ?? "pending" },
    {
      payment_status: input.payment_status,
      send_status: input.send_status ?? "pending",
    },
    true
  );
  await logCoinStatusChanges(data.id, userId, statusChanges);

  await logAudit(userId, "CREATE_COIN_REQUEST", "coin_request", data.id, {
    request_id: input.request_id,
    payment_status: input.payment_status,
    send_status: input.send_status ?? "pending",
  });

  return mapCoinRequest(data);
}

export async function updateCoinRequest(
  id: string,
  userId: string,
  input: Partial<CoinRequestInput>,
  options: AccessOptions = {}
): Promise<CoinRequest> {
  const supabase = await createClient();

  const existing = await getCoinRequest(id, userId, options);
  if (!existing) throw new Error("Coin request not found");

  const ownerUserId = existing.user_id;

  const merged: CoinRequestInput = {
    request_id: input.request_id ?? existing.request_id,
    who_requested: input.who_requested ?? existing.who_requested,
    price: input.price ?? existing.price,
    coin_amount: input.coin_amount ?? existing.coin_amount,
    payment_status: input.payment_status ?? existing.payment_status,
    send_status: input.send_status ?? existing.send_status,
    payment_method: input.payment_method ?? existing.payment_method,
    payment_method_other:
      input.payment_method_other ?? existing.payment_method_other,
    txn_id: input.txn_id ?? existing.txn_id,
    notes: input.notes !== undefined ? input.notes : existing.notes,
  };

  if (input.request_id && input.request_id !== existing.request_id) {
    const { data: duplicate } = await supabase
      .from("coin_requests")
      .select("id")
      .eq("user_id", ownerUserId)
      .eq("request_id", input.request_id)
      .neq("id", id)
      .maybeSingle();

    if (duplicate) throw new Error("DUPLICATE_REQUEST_ID");
  }

  const paymentFields = normalizePaymentFields(merged);

  let updateQuery = supabase
    .from("coin_requests")
    .update({
      request_id: merged.request_id,
      who_requested: merged.who_requested,
      price: merged.price,
      coin_amount: merged.coin_amount,
      payment_status: merged.payment_status,
      send_status: merged.send_status,
      ...paymentFields,
      notes: merged.notes ?? null,
    })
    .eq("id", id);

  if (!options.adminScope) {
    updateQuery = updateQuery.eq("user_id", userId);
  }

  const { data, error } = await updateQuery.select().single();

  if (error) throw error;

  const statusChanges = collectStatusChanges(existing, {
    payment_status: merged.payment_status,
    send_status: merged.send_status,
  });
  await logCoinStatusChanges(id, userId, statusChanges);

  await logAudit(userId, "UPDATE_COIN_REQUEST", "coin_request", id, {
    request_id: merged.request_id,
    ...(statusChanges.length > 0
      ? {
          status_changes: statusChanges.map((change) => ({
            type: change.statusType,
            from: change.oldStatus,
            to: change.newStatus,
          })),
        }
      : {}),
  });

  return mapCoinRequest(data);
}

export async function deleteCoinRequest(
  id: string,
  userId: string,
  options: AccessOptions = {}
): Promise<void> {
  const supabase = await createClient();
  let query = supabase.from("coin_requests").delete().eq("id", id);

  if (!options.adminScope) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) throw error;

  await logAudit(userId, "DELETE_COIN_REQUEST", "coin_request", id);
}

export { getCoinRequestStatusLogs };
