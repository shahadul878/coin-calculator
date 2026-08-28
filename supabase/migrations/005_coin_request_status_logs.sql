-- Track payment and send status changes with timestamps

CREATE TABLE IF NOT EXISTS coin_request_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_request_id UUID NOT NULL REFERENCES coin_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status_type TEXT NOT NULL CHECK (status_type IN ('payment', 'send')),
  old_status TEXT,
  new_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_logs_coin_request_id
  ON coin_request_status_logs(coin_request_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_created_at
  ON coin_request_status_logs(created_at);

ALTER TABLE coin_request_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coin request status logs"
  ON coin_request_status_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coin_requests
      WHERE coin_requests.id = coin_request_status_logs.coin_request_id
        AND (coin_requests.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert own coin request status logs"
  ON coin_request_status_logs FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM coin_requests
      WHERE coin_requests.id = coin_request_status_logs.coin_request_id
        AND coin_requests.user_id = auth.uid()
    )
  );
