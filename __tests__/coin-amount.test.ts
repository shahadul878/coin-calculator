import { describe, it, expect } from "vitest";
import {
  calculatePricePerLac,
  formatPricePerLac,
  parseCoinAmount,
} from "@/lib/utils/coin-amount";

describe("calculatePricePerLac", () => {
  it("returns price per 100k coins when coin amount is positive", () => {
    expect(calculatePricePerLac(500, 100_000)).toBe(500);
    expect(calculatePricePerLac(250, 50_000)).toBe(500);
    expect(calculatePricePerLac(1_000, 1_000_000)).toBe(100);
  });

  it("returns null for invalid or zero coin amounts", () => {
    expect(calculatePricePerLac(100, 0)).toBeNull();
    expect(calculatePricePerLac(100, -1)).toBeNull();
    expect(calculatePricePerLac(NaN, 1_000)).toBeNull();
    expect(calculatePricePerLac(100, NaN)).toBeNull();
  });
});

describe("formatPricePerLac", () => {
  it("formats valid values with two decimal places", () => {
    expect(formatPricePerLac(500, 100_000)).toBe("500.00");
    expect(formatPricePerLac(1234.5, 200_000)).toBe("617.25");
  });

  it("returns em dash when coin amount is invalid", () => {
    expect(formatPricePerLac(100, 0)).toBe("—");
  });
});

describe("parseCoinAmount integration", () => {
  it("works with shorthand when computing price per lac", () => {
    const coins = parseCoinAmount("1lac");
    expect(coins).toBe(100_000);
    expect(calculatePricePerLac(750, coins)).toBe(750);
  });
});
