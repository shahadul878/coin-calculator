import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getCurrentUser(): Promise<{
  id: string;
  profile: Profile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { id: user.id, profile: profile as Profile | null };
}

/** Super admin — profiles.role = 'admin' with full cross-user access via RLS. */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "admin";
}

export const isSuperAdmin = isAdmin;

export function hasAdminScope(profile: Profile | null): boolean {
  return isAdmin(profile);
}

export function canAccessResource(
  userId: string,
  resourceUserId: string,
  profile: Profile | null
): boolean {
  return userId === resourceUserId || isAdmin(profile);
}
