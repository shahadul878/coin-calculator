import type { PaymentStatus, SendStatus, StatusLogType } from "@/types";

export interface StatusChange {
  statusType: StatusLogType;
  oldStatus: string | null;
  newStatus: string;
}

export function collectStatusChanges(
  existing: { payment_status: PaymentStatus; send_status: SendStatus },
  next: { payment_status: PaymentStatus; send_status: SendStatus },
  isCreate = false
): StatusChange[] {
  const changes: StatusChange[] = [];

  if (isCreate || existing.payment_status !== next.payment_status) {
    changes.push({
      statusType: "payment",
      oldStatus: isCreate ? null : existing.payment_status,
      newStatus: next.payment_status,
    });
  }

  if (isCreate || existing.send_status !== next.send_status) {
    changes.push({
      statusType: "send",
      oldStatus: isCreate ? null : existing.send_status,
      newStatus: next.send_status,
    });
  }

  return changes;
}

export function formatStatusLabel(
  statusType: StatusLogType,
  status: string
): string {
  if (statusType === "payment") {
    const labels: Record<PaymentStatus, string> = {
      paid: "Paid",
      due: "Due",
      partial: "Partial",
    };
    return labels[status as PaymentStatus] ?? status;
  }

  const labels: Record<SendStatus, string> = {
    done: "Done",
    pending: "Pending",
    cancel: "Cancel",
  };
  return labels[status as SendStatus] ?? status;
}
