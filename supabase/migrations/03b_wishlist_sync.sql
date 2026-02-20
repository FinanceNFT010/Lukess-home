-- ============================================================
-- BLOCK 3b: Wishlist sync — localStorage → Supabase
-- EXECUTE THIS IN SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh/editor
-- ============================================================

-- Wishlist table for logged-in users
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id
  ON wishlists(user_id);
