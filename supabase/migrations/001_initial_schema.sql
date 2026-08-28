-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coin requests table
CREATE TABLE IF NOT EXISTS coin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id VARCHAR(6) NOT NULL,
  who_requested TEXT NOT NULL,
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  coin_amount NUMERIC(15, 4) NOT NULL CHECK (coin_amount > 0),
  payment_status TEXT NOT NULL DEFAULT 'due' CHECK (payment_status IN ('paid', 'due', 'partial')),
  send_status TEXT NOT NULL DEFAULT 'pending' CHECK (send_status IN ('done', 'pending', 'cancel')),
  payment_method TEXT CHECK (payment_method IN ('bkash', 'nagad', 'others')),
  payment_method_other TEXT,
  txn_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, request_id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('coin_request')),
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coin_requests_user_id ON coin_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_requests_request_id ON coin_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_coin_requests_payment_status ON coin_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_coin_requests_send_status ON coin_requests(send_status);
CREATE INDEX IF NOT EXISTS idx_coin_requests_payment_method ON coin_requests(payment_method);
CREATE INDEX IF NOT EXISTS idx_coin_requests_created_at ON coin_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_coin_requests_who_requested ON coin_requests(who_requested);
CREATE INDEX IF NOT EXISTS idx_coin_requests_txn_id ON coin_requests(txn_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coin_requests_updated_at
  BEFORE UPDATE ON coin_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Grant Supabase Auth admin access for signup trigger
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, public;

-- Coin requests policies
CREATE POLICY "Users can view own coin requests"
  ON coin_requests FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own coin requests"
  ON coin_requests FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own coin requests"
  ON coin_requests FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own coin requests"
  ON coin_requests FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- Audit logs policies
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_admin());
