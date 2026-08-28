import type { PaymentMethod } from "@/types";

const labels: Record<PaymentMethod, string> = {
  bkash: "Bkash",
  nagad: "Nagad",
  others: "Others",
};

export function formatPaymentMethod(
  method: PaymentMethod | null,
  other: string | null
): string {
  if (!method) return "—";
  if (method === "others" && other) return other;
  return labels[method];
}
