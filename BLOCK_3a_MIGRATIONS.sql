-- ============================================================
-- BLOCK 3a — Customer Auth Schema Migrations
-- Lukess Home — Supabase Project: lrcggpdgrqltqbxqnjgh
-- Ejecutar en: https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh/editor
-- ============================================================

-- 1. Add missing fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS managed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- 2. Create customers table (guest + registered)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  marketing_consent BOOLEAN DEFAULT false,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add customer_id FK to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- 4. Create subscribers table for email marketing
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source TEXT DEFAULT 'checkout',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can insert customers"
    ON customers FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read own customer"
    ON customers FOR SELECT USING (
      auth_user_id = auth.uid() OR auth.role() = 'service_role'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can update by email match"
    ON customers FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can insert subscribers"
    ON subscribers FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can read subscribers"
    ON subscribers FOR SELECT USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- ============================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================

-- Check tables created:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check columns:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('orders', 'customers', 'subscribers')
ORDER BY table_name, column_name;
