import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { generateCoinRequestReport } from "@/lib/services/report.service";
import { coinRequestReportQuerySchema } from "@/lib/validations/report";
import { generateCoinRequestReportPdf } from "@/lib/utils/report-pdf";
import {
  unauthorizedError,
  validationError,
  serverError,
} from "@/lib/utils/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const pdfBuffer = await generateCoinRequestReportPdf(report);
    const filename = `coin-requests-report-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("PDF export failed:", error);
    return serverError();
  }
}
