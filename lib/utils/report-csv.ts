import type { CoinRequest } from "@/types";

function formatPaymentMethod(
  method: CoinRequest["payment_method"],
  other: string | null
): string {
  if (!method) return "";
  if (method === "others" && other) return other;
  if (method === "bkash") return "Bkash";
  if (method === "nagad") return "Nagad";
  return "Others";
}

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatReportDate(date: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export function coinRequestsToCsv(rows: CoinRequest[]): string {
  const headers = [
    "Request ID",
    "Who Requested",
    "Price",
    "Coin Amount",
    "Payment Status",
    "Send Status",
    "Payment Method",
    "Txn ID",
    "Notes",
    "Created At",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.request_id,
        row.who_requested,
        row.price.toFixed(2),
        row.coin_amount,
        row.payment_status,
        row.send_status,
        formatPaymentMethod(row.payment_method, row.payment_method_other),
        row.txn_id,
        row.notes,
        formatReportDate(row.created_at),
      ]
        .map(escapeCsvValue)
        .join(",")
    ),
  ];

  return lines.join("\n");
}
