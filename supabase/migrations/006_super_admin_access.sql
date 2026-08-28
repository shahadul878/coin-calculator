-- Super admin (profiles.role = 'admin') elevated access fixes

-- Allow admins to insert status logs when updating any user's coin requests
DROP POLICY IF EXISTS "Users can insert own coin request status logs"
  ON coin_request_status_logs;

CREATE POLICY "Users can insert own coin request status logs"
  ON coin_request_status_logs FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM coin_requests
      WHERE coin_requests.id = coin_request_status_logs.coin_request_id
        AND (coin_requests.user_id = auth.uid() OR is_admin())
    )
  );
