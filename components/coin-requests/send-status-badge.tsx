import type { SendStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<SendStatus, string> = {
  done: "Done",
  pending: "Pending",
  cancel: "Cancel",
};

export function SendStatusBadge({ status }: { status: SendStatus }) {
  return (
    <Badge variant={status}>
      {statusLabels[status]}
    </Badge>
  );
}
