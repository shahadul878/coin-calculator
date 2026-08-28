-- Coin send status: done, pending, cancel
ALTER TABLE coin_requests
  ADD COLUMN IF NOT EXISTS send_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (send_status IN ('done', 'pending', 'cancel'));

CREATE INDEX IF NOT EXISTS idx_coin_requests_send_status ON coin_requests(send_status);
