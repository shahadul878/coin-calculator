import type { PaymentStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<PaymentStatus, string> = {
  paid: "Paid",
  due: "Due",
  partial: "Partial",
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={status}>
      {statusLabels[status]}
    </Badge>
  );
}
