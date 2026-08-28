import { describe, it, expect } from "vitest";
import { generateDemoCoinRequests } from "../scripts/demo-data";
import { generateCoinRequestReportPdf } from "@/lib/utils/report-pdf";
import type { CoinRequestReport } from "@/types";

function countPdfPages(buffer: Buffer): number {
  const matches = buffer.toString("binary").match(/\/Type\s*\/Page[^s]/g);
  return matches?.length ?? 0;
}

describe("demo report pdf", () => {
  it("generates a non-empty PDF for 200 demo rows", async () => {
    const userId = "00000000-0000-0000-0000-000000000001";
    const rows = generateDemoCoinRequests(userId, 200).map((row, index) => ({
      ...row,
      id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
      user_id: userId,
      payment_method: row.payment_method,
      payment_method_other: row.payment_method_other,
      txn_id: row.txn_id,
      notes: row.notes,
      updated_at: row.updated_at,
    }));

    const report: CoinRequestReport = {
      rows,
      summary: {
        totalRecords: rows.length,
        totalCoins: rows.reduce((sum, row) => sum + row.coin_amount, 0),
        totalPrice: rows.reduce((sum, row) => sum + row.price, 0),
        paidCount: rows.filter((row) => row.payment_status === "paid").length,
        dueCount: rows.filter((row) => row.payment_status === "due").length,
        partialCount: rows.filter((row) => row.payment_status === "partial").length,
        sendPending: rows.filter((row) => row.send_status === "pending").length,
        sendDone: rows.filter((row) => row.send_status === "done").length,
        sendCancel: rows.filter((row) => row.send_status === "cancel").length,
      },
      filters: {
        dateFrom: "2026-06-01",
        dateTo: "2026-08-28",
      },
    };

    const pdf = await generateCoinRequestReportPdf(report);
    expect(pdf.length).toBeGreaterThan(5000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");

    const pageCount = countPdfPages(pdf);
    expect(pageCount).toBeGreaterThanOrEqual(8);
    expect(pageCount).toBeLessThanOrEqual(12);
  }, 30000);
});
