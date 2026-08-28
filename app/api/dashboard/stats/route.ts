import { getCurrentUser, hasAdminScope } from "@/lib/permissions";
import {
  successResponse,
  unauthorizedError,
  serverError,
} from "@/lib/utils/api-response";
import { getDashboardStats } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const stats = await getDashboardStats(user.id, {
      adminScope: hasAdminScope(user.profile),
    });
    return successResponse(stats);
  } catch {
    return serverError();
  }
}
