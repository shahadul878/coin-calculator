-- Expand request_id max length to 20 and enforce digits-only (1-20 digits)

ALTER TABLE coin_requests
  ALTER COLUMN request_id TYPE VARCHAR(20);

ALTER TABLE coin_requests
  DROP CONSTRAINT IF EXISTS coin_requests_request_id_format;

ALTER TABLE coin_requests
  ADD CONSTRAINT coin_requests_request_id_format
  CHECK (request_id ~ '^\d{1,20}$');
