-- ============================================================
-- BLOCK 3d: Shipping fields — delivery options + address
-- EXECUTE THIS IN SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh/editor
-- ============================================================

-- Add shipping/delivery fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'delivery'
  CHECK (delivery_method IN ('delivery', 'pickup')),
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_reference TEXT,
ADD COLUMN IF NOT EXISTS shipping_district TEXT,
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS gps_coordinates TEXT;

-- Note: total = subtotal - discount + shipping_cost
-- This logic is handled in the application layer (no migration needed).

-- Optional: index for filtering orders by delivery method
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method
  ON orders(delivery_method);
