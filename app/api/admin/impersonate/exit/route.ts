import { cookies } from "next/headers";

import {
  clearImpersonationCookies,
  getAdminSessionBackup,
  getImpersonationMeta,
} from "@/lib/impersonation";
import { logAudit } from "@/lib/services/audit.service";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  serverError,
  successResponse,
  unauthorizedError,
} from "@/lib/utils/api-response";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const backup = getAdminSessionBackup(cookieStore);
    const meta = getImpersonationMeta(cookieStore);

    if (!backup || !meta) {
      return errorResponse("Not currently impersonating", 400);
    }

    const supabase = await createClient();
    await supabase.auth.signOut();

    const { error } = await supabase.auth.setSession({
      access_token: backup.access_token,
      refresh_token: backup.refresh_token,
    });

    if (error) {
      clearImpersonationCookies(cookieStore);
      return errorResponse("Failed to restore admin session. Please sign in again.", 401);
    }

    clearImpersonationCookies(cookieStore);

    await logAudit(backup.admin_id, "IMPERSONATE_END", undefined, meta.target_id, {
      target_email: meta.target_email,
    });

    return successResponse({ redirect: "/dashboard/admin/users" });
  } catch {
    return serverError();
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const meta = getImpersonationMeta(cookieStore);

  if (!meta) {
    return unauthorizedError();
  }

  return successResponse(meta);
}
