import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import {
  isImpersonating,
  setImpersonationCookies,
} from "@/lib/impersonation";
import { getCurrentUser, isAdmin } from "@/lib/permissions";
import { logAudit } from "@/lib/services/audit.service";
import {
  createTargetUserSession,
  ImpersonationError,
  resolveTargetProfile,
} from "@/lib/services/impersonation.service";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  forbiddenError,
  notFoundError,
  serverError,
  successResponse,
  unauthorizedError,
  validationError,
} from "@/lib/utils/api-response";
import { impersonateSchema } from "@/lib/validations/impersonation";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();
    if (!isAdmin(user.profile)) return forbiddenError();

    const cookieStore = await cookies();
    if (isImpersonating(cookieStore)) {
      return errorResponse("Exit current impersonation before starting another", 409);
    }

    const body = await request.json();
    const parsed = impersonateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? "Validation failed");
    }

    const targetProfile = await resolveTargetProfile(
      parsed.data.userId,
      parsed.data.email
    );

    if (targetProfile.id === user.id) {
      return errorResponse("Cannot impersonate yourself", 400);
    }

    const supabase = await createClient();
    const {
      data: { session: adminSession },
    } = await supabase.auth.getSession();

    if (!adminSession?.access_token || !adminSession.refresh_token) {
      return errorResponse("No active admin session", 401);
    }

    const targetSession = await createTargetUserSession(targetProfile.email);

    setImpersonationCookies(
      cookieStore,
      {
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
        admin_id: user.id,
      },
      {
        admin_id: user.id,
        admin_email: user.profile?.email ?? "",
        target_id: targetProfile.id,
        target_email: targetProfile.email,
      }
    );

    await supabase.auth.setSession({
      access_token: targetSession.access_token,
      refresh_token: targetSession.refresh_token,
    });

    await logAudit(user.id, "IMPERSONATE_START", undefined, targetProfile.id, {
      target_email: targetProfile.email,
      target_role: targetProfile.role,
    });

    return successResponse({
      target: {
        id: targetProfile.id,
        email: targetProfile.email,
        full_name: targetProfile.full_name,
        role: targetProfile.role,
      },
      redirect: "/dashboard",
    });
  } catch (err) {
    if (err instanceof ImpersonationError) {
      if (err.code === "USER_NOT_FOUND") {
        return notFoundError("User");
      }
      return errorResponse(err.message, 400);
    }
    return serverError();
  }
}
