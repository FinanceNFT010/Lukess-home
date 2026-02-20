-- ============================================================
-- BLOCK 3d: Shipping fields — GPS-based delivery + pickup
-- EXECUTE THIS IN SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh/editor
-- ============================================================

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'delivery'
  CHECK (delivery_method IN ('delivery', 'pickup')),
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_reference TEXT,
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS gps_lat NUMERIC(10,7),
ADD COLUMN IF NOT EXISTS gps_lng NUMERIC(10,7),
ADD COLUMN IF NOT EXISTS gps_distance_km NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS maps_link TEXT;

-- Note: total = subtotal - discount + shipping_cost
-- Logic is handled in the application layer.

CREATE INDEX IF NOT EXISTS idx_orders_delivery_method
  ON orders(delivery_method);

-- Recipient info (person who receives the package, may differ from buyer)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS recipient_name TEXT,
ADD COLUMN IF NOT EXISTS recipient_phone TEXT;

-- Delivery instructions for the courier (optional)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;
