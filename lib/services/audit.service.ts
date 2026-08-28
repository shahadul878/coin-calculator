import { createClient } from "@/lib/supabase/server";
import type { AuditAction, EntityType } from "@/types";

export async function logAudit(
  userId: string,
  action: AuditAction,
  entityType?: EntityType,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();

  // Never include txn_id or payment sensitive data in metadata
  const safeMetadata = metadata
    ? Object.fromEntries(
        Object.entries(metadata).filter(
          ([key]) =>
            !["txn_id", "pin_number", "payment_method_other"].includes(key)
        )
      )
    : null;

  await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    metadata: safeMetadata,
  });
}
