import { NextRequest } from "next/server";
import { getCurrentUser, hasAdminScope } from "@/lib/permissions";
import { generateCoinRequestReport } from "@/lib/services/report.service";
import { coinRequestReportQuerySchema } from "@/lib/validations/report";
import {
  successResponse,
  unauthorizedError,
  validationError,
  serverError,
} from "@/lib/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const { searchParams } = request.nextUrl;
    const parsed = coinRequestReportQuerySchema.safeParse({
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      request_id: searchParams.get("request_id") || undefined,
      who_requested: searchParams.get("who_requested") || undefined,
    });

    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? "Invalid filters");
    }

    const report = await generateCoinRequestReport({
      userId: user.id,
      adminScope: hasAdminScope(user.profile),
      dateFrom: parsed.data.date_from,
      dateTo: parsed.data.date_to,
      requestId: parsed.data.request_id,
      whoRequested: parsed.data.who_requested,
    });

    return successResponse(report);
  } catch {
    return serverError();
  }
}
