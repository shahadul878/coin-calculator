import Decimal from "decimal.js";

export function calculateTotals(
  coinQuantity: number,
  pricePerCoin: number,
  discount: number,
  additionalCharge: number
) {
  const subtotal = new Decimal(coinQuantity)
    .times(pricePerCoin)
    .toDecimalPlaces(2);
  const grandTotal = subtotal
    .minus(discount)
    .plus(additionalCharge)
    .toDecimalPlaces(2);

  return {
    subtotal: subtotal.toNumber(),
    grand_total: grandTotal.toNumber(),
  };
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  return 0;
}
