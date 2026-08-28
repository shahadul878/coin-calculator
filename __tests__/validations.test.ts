import { describe, it, expect } from "vitest";
import { calculateTotals } from "@/lib/utils/calculations";
import { coinRequestSchema } from "@/lib/validations";

describe("calculateTotals", () => {
  it("computes subtotal and grand total correctly", () => {
    const result = calculateTotals(100, 10, 50, 25);
    expect(result.subtotal).toBe(1000);
    expect(result.grand_total).toBe(975);
  });

  it("handles decimal precision", () => {
    const result = calculateTotals(3, 0.1, 0, 0);
    expect(result.subtotal).toBe(0.3);
    expect(result.grand_total).toBe(0.3);
  });
});

describe("coinRequestSchema", () => {
  it("requires txn_id and payment_method when paid", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: 50,
      payment_status: "paid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid paid request", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: 50,
      payment_status: "paid",
      payment_method: "bkash",
      txn_id: "ABC123",
    });
    expect(result.success).toBe(true);
  });

  it("clears payment fields for due status", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: 50,
      payment_status: "due",
    });
    expect(result.success).toBe(true);
  });

  it("requires payment_method_other when others selected", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: 50,
      payment_status: "partial",
      payment_method: "others",
      txn_id: "XYZ789",
    });
    expect(result.success).toBe(false);
  });
});
