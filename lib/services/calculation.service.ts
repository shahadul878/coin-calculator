import { createClient } from "@/lib/supabase/server";
import { calculateTotals } from "@/lib/utils/calculations";
import { logAudit } from "./audit.service";
import type { Calculation, PaginatedResponse } from "@/types";
import type { CalculationInput } from "@/lib/validations";

interface ListParams {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export async function listCalculations(
  params: ListParams
): Promise<PaginatedResponse<Calculation>> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("calculations")
    .select("*", { count: "exact" })
    .eq("user_id", params.userId);

  if (params.search) {
    query = query.or(
      `notes.ilike.%${params.search}%,coin_quantity.eq.${params.search}`
    );
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
    data: (data as Calculation[]) ?? [],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCalculation(
  id: string,
  userId: string
): Promise<Calculation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calculations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as Calculation;
}

export async function createCalculation(
  userId: string,
  input: CalculationInput
): Promise<Calculation> {
  const supabase = await createClient();
  const totals = calculateTotals(
    input.coin_quantity,
    input.price_per_coin,
    input.discount ?? 0,
    input.additional_charge ?? 0
  );

  const { data, error } = await supabase
    .from("calculations")
    .insert({
      user_id: userId,
      coin_quantity: input.coin_quantity,
      price_per_coin: input.price_per_coin,
      discount: input.discount ?? 0,
      additional_charge: input.additional_charge ?? 0,
      subtotal: totals.subtotal,
      grand_total: totals.grand_total,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  await logAudit(userId, "CREATE_CALCULATION", "calculation", data.id, {
    coin_quantity: input.coin_quantity,
  });

  return data as Calculation;
}

export async function updateCalculation(
  id: string,
  userId: string,
  input: Partial<CalculationInput>
): Promise<Calculation> {
  const supabase = await createClient();

  const existing = await getCalculation(id, userId);
  if (!existing) throw new Error("Calculation not found");

  const merged = {
    coin_quantity: input.coin_quantity ?? existing.coin_quantity,
    price_per_coin: input.price_per_coin ?? existing.price_per_coin,
    discount: input.discount ?? existing.discount,
    additional_charge: input.additional_charge ?? existing.additional_charge,
    notes: input.notes !== undefined ? input.notes : existing.notes,
  };

  const totals = calculateTotals(
    merged.coin_quantity,
    merged.price_per_coin,
    merged.discount,
    merged.additional_charge
  );

  const { data, error } = await supabase
    .from("calculations")
    .update({
      ...merged,
      subtotal: totals.subtotal,
      grand_total: totals.grand_total,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  await logAudit(userId, "UPDATE_CALCULATION", "calculation", id);

  return data as Calculation;
}

export async function deleteCalculation(id: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("calculations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;

  await logAudit(userId, "DELETE_CALCULATION", "calculation", id);
}

export async function duplicateCalculation(
  id: string,
  userId: string
): Promise<Calculation> {
  const existing = await getCalculation(id, userId);
  if (!existing) throw new Error("Calculation not found");

  return createCalculation(userId, {
    coin_quantity: existing.coin_quantity,
    price_per_coin: existing.price_per_coin,
    discount: existing.discount,
    additional_charge: existing.additional_charge,
    notes: existing.notes,
  });
}
