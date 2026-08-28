import { describe, it, expect } from "vitest";
import {
  generateDemoCoinRequests,
  summarizeDemoRows,
} from "../scripts/demo-data";

describe("generateDemoCoinRequests", () => {
  const userId = "00000000-0000-0000-0000-000000000001";
  const baseDate = new Date("2026-08-28T12:00:00.000Z");

  it("generates 200 unique demo requests", () => {
    const rows = generateDemoCoinRequests(userId, 200, baseDate);
    const summary = summarizeDemoRows(rows);

    expect(rows).toHaveLength(200);
    expect(summary.uniqueRequestIds).toBe(200);
    expect(rows[0].request_id).toBe("000001");
    expect(rows[199].request_id).toBe("000200");
  });

  it("assigns all rows to the target user", () => {
    const rows = generateDemoCoinRequests(userId, 200, baseDate);
    expect(rows.every((row) => row.user_id === userId)).toBe(true);
  });

  it("uses valid payment rules for due requests", () => {
    const rows = generateDemoCoinRequests(userId, 200, baseDate);
    const dueRows = rows.filter((row) => row.payment_status === "due");

    expect(dueRows.length).toBeGreaterThan(0);
    dueRows.forEach((row) => {
      expect(row.payment_method).toBeNull();
      expect(row.txn_id).toBeNull();
    });
  });

  it("uses payment details for paid and partial requests", () => {
    const rows = generateDemoCoinRequests(userId, 200, baseDate);
    const paidLike = rows.filter(
      (row) => row.payment_status === "paid" || row.payment_status === "partial"
    );

    expect(paidLike.length).toBeGreaterThan(0);
    paidLike.forEach((row) => {
      expect(row.payment_method).not.toBeNull();
      expect(row.txn_id).not.toBeNull();
    });
  });

  it("spreads created dates across recent history", () => {
    const rows = generateDemoCoinRequests(userId, 200, baseDate);
    const timestamps = rows.map((row) => new Date(row.created_at).getTime());
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);

    expect(max - min).toBeGreaterThan(7 * 24 * 60 * 60 * 1000);
  });

  it("includes varied coin amounts for summary testing", () => {
    const rows = generateDemoCoinRequests(userId, 200, baseDate);
    const amounts = new Set(rows.map((row) => row.coin_amount));

    expect(amounts.has(1000)).toBe(true);
    expect(amounts.has(100000)).toBe(true);
    expect(amounts.has(1000000)).toBe(true);
  });
});
