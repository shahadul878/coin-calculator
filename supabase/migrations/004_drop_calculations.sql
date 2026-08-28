-- Remove calculator feature: drop calculations table and related objects

DROP POLICY IF EXISTS "Users can delete own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can update own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can insert own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can view own calculations" ON calculations;

DROP TRIGGER IF EXISTS update_calculations_updated_at ON calculations;
DROP INDEX IF EXISTS idx_calculations_created_at;
DROP INDEX IF EXISTS idx_calculations_user_id;

DROP TABLE IF EXISTS calculations;

ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_type_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_entity_type_check
  CHECK (entity_type IN ('coin_request'));
