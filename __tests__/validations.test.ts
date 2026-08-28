import { describe, it, expect } from "vitest";
import { coinRequestSchema } from "@/lib/validations";

describe("coinRequestSchema", () => {
  it("requires txn_id and payment_method when paid", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: 50,
      payment_status: "paid",
      send_status: "pending",
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
      send_status: "done",
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
      send_status: "pending",
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
      send_status: "pending",
      payment_method: "others",
      txn_id: "XYZ789",
    });
    expect(result.success).toBe(false);
  });
});
