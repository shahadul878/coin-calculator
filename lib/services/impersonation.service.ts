import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export class ImpersonationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "USER_NOT_FOUND"
      | "SESSION_CREATE_FAILED"
      | "NO_ADMIN_SESSION"
      | "SELF_IMPERSONATION"
      | "ALREADY_IMPERSONATING"
  ) {
    super(message);
    this.name = "ImpersonationError";
  }
}

export async function resolveTargetProfile(
  userId?: string,
  email?: string
): Promise<Profile> {
  const admin = createAdminClient();

  if (userId) {
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw new ImpersonationError("Target user not found", "USER_NOT_FOUND");
    }

    return data as Profile;
  }

  if (email) {
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      throw new ImpersonationError("Target user not found", "USER_NOT_FOUND");
    }

    return data as Profile;
  }

  throw new ImpersonationError("Target user not found", "USER_NOT_FOUND");
}

export async function createTargetUserSession(targetEmail: string) {
  const admin = createAdminClient();

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: targetEmail,
    });

  if (linkError || !linkData.properties?.hashed_token) {
    throw new ImpersonationError(
      "Failed to create impersonation session",
      "SESSION_CREATE_FAILED"
    );
  }

  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "email",
    });

  if (sessionError || !sessionData.session) {
    throw new ImpersonationError(
      "Failed to verify impersonation session",
      "SESSION_CREATE_FAILED"
    );
  }

  return sessionData.session;
}

export async function listUsersForAdmin(options: {
  search?: string;
  page: number;
  limit: number;
}) {
  const supabase = await createClient();
  const from = (options.page - 1) * options.limit;
  const to = from + options.limit - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("email", { ascending: true });

  if (options.search?.trim()) {
    const term = `%${options.search.trim()}%`;
    query = query.or(`email.ilike.${term},full_name.ilike.${term}`);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []) as Profile[],
    total: count ?? 0,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil((count ?? 0) / options.limit),
  };
}
