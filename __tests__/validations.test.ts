import { describe, it, expect } from "vitest";
import { parseCoinAmount, formatCoinAmount } from "@/lib/utils/coin-amount";
import { coinRequestSchema } from "@/lib/validations";

describe("parseCoinAmount", () => {
  it("parses plain numbers", () => {
    expect(parseCoinAmount("1000")).toBe(1000);
    expect(parseCoinAmount("1.5")).toBe(1.5);
    expect(parseCoinAmount(500)).toBe(500);
  });

  it("parses K suffix", () => {
    expect(parseCoinAmount("1K")).toBe(1000);
    expect(parseCoinAmount("1k")).toBe(1000);
    expect(parseCoinAmount("1.5K")).toBe(1500);
    expect(parseCoinAmount("10 k")).toBe(10000);
  });

  it("parses lac/lakh suffix", () => {
    expect(parseCoinAmount("1lac")).toBe(100000);
    expect(parseCoinAmount("1 lac")).toBe(100000);
    expect(parseCoinAmount("1lakh")).toBe(100000);
    expect(parseCoinAmount("2.5lac")).toBe(250000);
    expect(parseCoinAmount("1L")).toBe(100000);
  });

  it("parses M suffix", () => {
    expect(parseCoinAmount("1M")).toBe(1000000);
    expect(parseCoinAmount("1m")).toBe(1000000);
    expect(parseCoinAmount("2.5M")).toBe(2500000);
  });

  it("returns NaN for invalid input", () => {
    expect(parseCoinAmount("abc")).toBeNaN();
    expect(parseCoinAmount("")).toBeNaN();
  });
});

describe("formatCoinAmount", () => {
  it("formats compact values", () => {
    expect(formatCoinAmount(1000)).toBe("1K");
    expect(formatCoinAmount(100000)).toBe("1lac");
    expect(formatCoinAmount(1000000)).toBe("1M");
  });
});

describe("coinRequestSchema", () => {
  it("requires txn_id and payment_method when paid", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: "1K",
      payment_status: "paid",
      send_status: "pending",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid paid request with coin shorthand", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: "1lac",
      payment_status: "paid",
      send_status: "done",
      payment_method: "bkash",
      txn_id: "ABC123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coin_amount).toBe(100000);
    }
  });

  it("clears payment fields for due status", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: "1M",
      payment_status: "due",
      send_status: "pending",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coin_amount).toBe(1000000);
    }
  });

  it("requires payment_method_other when others selected", () => {
    const result = coinRequestSchema.safeParse({
      request_id: "000001",
      who_requested: "John",
      price: 100,
      coin_amount: "2K",
      payment_status: "partial",
      send_status: "pending",
      payment_method: "others",
      txn_id: "XYZ789",
    });
    expect(result.success).toBe(false);
  });
});
