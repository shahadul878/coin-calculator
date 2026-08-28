import { createClient } from "@/lib/supabase/server";
import { normalizePaymentFields } from "@/lib/validations";
import { logAudit } from "./audit.service";
import type { CoinRequest, PaginatedResponse, PaymentMethod } from "@/types";
import type { CoinRequestInput } from "@/lib/validations";

interface ListParams {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
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

  let query = supabase
    .from("coin_requests")
    .select("*", { count: "exact" })
    .eq("user_id", params.userId);

  if (params.search) {
    query = query.or(
      `who_requested.ilike.%${params.search}%,request_id.ilike.%${params.search}%,txn_id.ilike.%${params.search}%`
    );
  }

  if (params.paymentStatus) {
    query = query.eq("payment_status", params.paymentStatus);
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
  userId: string
): Promise<CoinRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coin_requests")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

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
      ...paymentFields,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  await logAudit(userId, "CREATE_COIN_REQUEST", "coin_request", data.id, {
    request_id: input.request_id,
    payment_status: input.payment_status,
  });

  return mapCoinRequest(data);
}

export async function updateCoinRequest(
  id: string,
  userId: string,
  input: Partial<CoinRequestInput>
): Promise<CoinRequest> {
  const supabase = await createClient();

  const existing = await getCoinRequest(id, userId);
  if (!existing) throw new Error("Coin request not found");

  const merged: CoinRequestInput = {
    request_id: input.request_id ?? existing.request_id,
    who_requested: input.who_requested ?? existing.who_requested,
    price: input.price ?? existing.price,
    coin_amount: input.coin_amount ?? existing.coin_amount,
    payment_status: input.payment_status ?? existing.payment_status,
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
      .eq("user_id", userId)
      .eq("request_id", input.request_id)
      .neq("id", id)
      .maybeSingle();

    if (duplicate) throw new Error("DUPLICATE_REQUEST_ID");
  }

  const paymentFields = normalizePaymentFields(merged);

  const { data, error } = await supabase
    .from("coin_requests")
    .update({
      request_id: merged.request_id,
      who_requested: merged.who_requested,
      price: merged.price,
      coin_amount: merged.coin_amount,
      payment_status: merged.payment_status,
      ...paymentFields,
      notes: merged.notes ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  await logAudit(userId, "UPDATE_COIN_REQUEST", "coin_request", id);

  return mapCoinRequest(data);
}

export async function deleteCoinRequest(id: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("coin_requests")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;

  await logAudit(userId, "DELETE_COIN_REQUEST", "coin_request", id);
}

export async function duplicateCoinRequest(
  id: string,
  userId: string
): Promise<CoinRequest> {
  const existing = await getCoinRequest(id, userId);
  if (!existing) throw new Error("Coin request not found");

  // Generate next request_id suggestion - user must provide unique ID on duplicate
  const supabase = await createClient();
  const { data: latest } = await supabase
    .from("coin_requests")
    .select("request_id")
    .eq("user_id", userId)
    .order("request_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNum = latest
    ? String(parseInt(latest.request_id, 10) + 1).padStart(6, "0")
    : "000001";

  return createCoinRequest(userId, {
    request_id: nextNum,
    who_requested: existing.who_requested,
    price: existing.price,
    coin_amount: existing.coin_amount,
    payment_status: "due",
    payment_method: null,
    payment_method_other: null,
    txn_id: null,
    notes: existing.notes,
  });
}
