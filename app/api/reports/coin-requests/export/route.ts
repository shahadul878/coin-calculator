import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { generateCoinRequestReport } from "@/lib/services/report.service";
import { coinRequestReportQuerySchema } from "@/lib/validations/report";
import { coinRequestsToCsv } from "@/lib/utils/report-csv";
import {
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
      dateFrom: parsed.data.date_from,
      dateTo: parsed.data.date_to,
      requestId: parsed.data.request_id,
      whoRequested: parsed.data.who_requested,
    });

    const csv = coinRequestsToCsv(report.rows);
    const filename = `coin-requests-report-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return serverError();
  }
}
