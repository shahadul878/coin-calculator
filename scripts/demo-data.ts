export type DemoPaymentStatus = "paid" | "due" | "partial";
export type DemoSendStatus = "done" | "pending" | "cancel";
export type DemoPaymentMethod = "bkash" | "nagad" | "others";

export interface DemoCoinRequest {
  user_id: string;
  request_id: string;
  who_requested: string;
  price: number;
  coin_amount: number;
  payment_status: DemoPaymentStatus;
  send_status: DemoSendStatus;
  payment_method: DemoPaymentMethod | null;
  payment_method_other: string | null;
  txn_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const REQUESTERS = [
  "Rahim Uddin",
  "Karim Hassan",
  "Fatima Begum",
  "Shahidul Islam",
  "Nusrat Jahan",
  "Arif Hossain",
  "Sabrina Ahmed",
  "Tanvir Rahman",
  "Mim Akter",
  "Imran Khan",
  "Priya Das",
  "Rubel Mia",
  "Sumaiya Khatun",
  "Jahid Hasan",
  "Lamia Sultana",
  "Omar Faruk",
  "Nadia Islam",
  "Faisal Ahmed",
  "Tania Rahman",
  "Mahmud Ali",
];

const COIN_AMOUNTS = [
  500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000,
  1500, 7500, 15000, 75000, 150000,
];

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

function seededPaymentStatus(index: number): DemoPaymentStatus {
  const statuses: DemoPaymentStatus[] = ["paid", "due", "partial"];
  return pick(statuses, index);
}

function seededSendStatus(index: number): DemoSendStatus {
  const statuses: DemoSendStatus[] = ["done", "pending", "cancel"];
  return pick(statuses, index + 1);
}

function seededCoinAmount(index: number): number {
  return pick(COIN_AMOUNTS, index + 3);
}

function seededPrice(coinAmount: number, index: number): number {
  const rate = 0.05 + (index % 10) * 0.01;
  return Math.round(coinAmount * rate * 100) / 100;
}

function seededCreatedAt(index: number, baseDate = new Date()): string {
  const daysAgo = index % 90;
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(9 + (index % 10), index % 60, 0, 0);
  return date.toISOString();
}

function paymentFields(
  paymentStatus: DemoPaymentStatus,
  index: number
): Pick<
  DemoCoinRequest,
  "payment_method" | "payment_method_other" | "txn_id"
> {
  if (paymentStatus === "due") {
    return {
      payment_method: null,
      payment_method_other: null,
      txn_id: null,
    };
  }

  const method = pick<DemoPaymentMethod>(["bkash", "nagad", "others"], index);
  return {
    payment_method: method,
    payment_method_other: method === "others" ? "Rocket" : null,
    txn_id: `TXN${String(index + 1).padStart(8, "0")}`,
  };
}

export function generateDemoCoinRequests(
  userId: string,
  count = 200,
  baseDate = new Date()
): DemoCoinRequest[] {
  const rows: DemoCoinRequest[] = [];

  for (let i = 1; i <= count; i += 1) {
    const payment_status = seededPaymentStatus(i);
    const coin_amount = seededCoinAmount(i);
    const created_at = seededCreatedAt(i, baseDate);
    const payment = paymentFields(payment_status, i);

    rows.push({
      user_id: userId,
      request_id: String(i).padStart(6, "0"),
      who_requested: pick(REQUESTERS, i),
      price: seededPrice(coin_amount, i),
      coin_amount,
      payment_status,
      send_status: seededSendStatus(i),
      ...payment,
      notes: i % 7 === 0 ? "Demo request for testing" : null,
      created_at,
      updated_at: created_at,
    });
  }

  return rows;
}

export const DEMO_REQUEST_COUNT = 200;

export function getDemoRequestIds(count = DEMO_REQUEST_COUNT): string[] {
  return Array.from({ length: count }, (_, i) =>
    String(i + 1).padStart(6, "0")
  );
}

export function summarizeDemoRows(rows: DemoCoinRequest[]) {
  return {
    total: rows.length,
    paid: rows.filter((row) => row.payment_status === "paid").length,
    due: rows.filter((row) => row.payment_status === "due").length,
    partial: rows.filter((row) => row.payment_status === "partial").length,
    sendDone: rows.filter((row) => row.send_status === "done").length,
    sendPending: rows.filter((row) => row.send_status === "pending").length,
    sendCancel: rows.filter((row) => row.send_status === "cancel").length,
    uniqueRequestIds: new Set(rows.map((row) => row.request_id)).size,
  };
}
