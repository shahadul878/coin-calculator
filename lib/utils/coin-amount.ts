export const LAC_COINS = 100_000;

const SUFFIX_MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  m: 1_000_000,
  lac: 100_000,
  lakh: 100_000,
  l: 100_000,
};

export function parseCoinAmount(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return NaN;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value !== "string") {
    return NaN;
  }

  const normalized = value.trim().replace(/,/g, "").toLowerCase().replace(/\s+/g, "");

  if (!normalized) {
    return NaN;
  }

  const plainNumber = normalized.match(/^(\d+(?:\.\d+)?)$/);
  if (plainNumber) {
    return parseFloat(plainNumber[1]);
  }

  const withSuffix = normalized.match(/^(\d+(?:\.\d+)?)(k|m|lac|lakh|l)$/);
  if (withSuffix) {
    const base = parseFloat(withSuffix[1]);
    const multiplier = SUFFIX_MULTIPLIERS[withSuffix[2]];
    return base * multiplier;
  }

  return NaN;
}

export function formatCoinAmount(value: number): string {
  if (!Number.isFinite(value)) return "—";

  if (value >= 1_000_000 && value % 1_000_000 === 0) {
    return `${value / 1_000_000}M`;
  }

  if (value >= 100_000 && value % 100_000 === 0) {
    return `${value / 100_000}lac`;
  }

  if (value >= 1_000 && value % 1_000 === 0) {
    return `${value / 1_000}K`;
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

export function calculatePricePerLac(
  price: number,
  coinAmount: number
): number | null {
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(coinAmount) ||
    coinAmount <= 0
  ) {
    return null;
  }

  return (price / coinAmount) * LAC_COINS;
}

export function formatPricePerLac(price: number, coinAmount: number): string {
  const value = calculatePricePerLac(price, coinAmount);
  if (value === null) return "—";

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
