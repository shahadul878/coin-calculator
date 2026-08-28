import { NextRequest } from "next/server";

import { getCurrentUser, isAdmin } from "@/lib/permissions";
import { listUsersForAdmin } from "@/lib/services/impersonation.service";
import {
  forbiddenError,
  serverError,
  successResponse,
  unauthorizedError,
  validationError,
} from "@/lib/utils/api-response";
import { adminUsersQuerySchema } from "@/lib/validations/impersonation";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();
    if (!isAdmin(user.profile)) return forbiddenError();

    const { searchParams } = request.nextUrl;
    const parsed = adminUsersQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? "Validation failed");
    }

    const result = await listUsersForAdmin({
      search: parsed.data.q,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return successResponse(result);
  } catch {
    return serverError();
  }
}
