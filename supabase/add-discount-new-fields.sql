-- Agregar campos de descuento y "nuevo" a productos
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columnas
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- 2. Crear índice para productos nuevos
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new) WHERE is_new = true;

-- 3. Crear índice para productos con descuento
CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_percentage) WHERE discount_percentage IS NOT NULL;

-- 4. Marcar algunos productos como NUEVOS (últimos 10 creados)
UPDATE products 
SET is_new = true 
WHERE id IN (
  SELECT id 
  FROM products 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 10
);

-- 5. Agregar descuentos a algunos productos (20-30%)
-- Productos con descuento de 20%
UPDATE products 
SET discount_percentage = 20 
WHERE id IN (
  SELECT id 
  FROM products 
  WHERE is_active = true 
  AND is_new = false
  ORDER BY RANDOM() 
  LIMIT 5
);

-- Productos con descuento de 25%
UPDATE products 
SET discount_percentage = 25 
WHERE id IN (
  SELECT id 
  FROM products 
  WHERE is_active = true 
  AND is_new = false
  AND discount_percentage IS NULL
  ORDER BY RANDOM() 
  LIMIT 3
);

-- Productos con descuento de 30%
UPDATE products 
SET discount_percentage = 30 
WHERE id IN (
  SELECT id 
  FROM products 
  WHERE is_active = true 
  AND is_new = false
  AND discount_percentage IS NULL
  ORDER BY RANDOM() 
  LIMIT 2
);

-- 6. Verificar cambios
SELECT 
  name,
  price,
  discount_percentage,
  is_new,
  CASE 
    WHEN discount_percentage IS NOT NULL 
    THEN ROUND(price * (1 - discount_percentage/100), 2)
    ELSE price 
  END as final_price
FROM products
WHERE is_active = true
AND (is_new = true OR discount_percentage IS NOT NULL)
ORDER BY created_at DESC;
