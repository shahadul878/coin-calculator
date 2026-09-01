-- request_id is an app user ID and may repeat across coin requests
ALTER TABLE coin_requests
  DROP CONSTRAINT IF EXISTS coin_requests_user_id_request_id_key;
