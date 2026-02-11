-- ═══════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar campos de descuentos y productos destacados
-- Fecha: 2026-02-10
-- Descripción: Agrega campos discount, is_featured e images a la tabla products
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Agregar campo discount (porcentaje de descuento 0-100)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0 CHECK (discount >= 0 AND discount <= 100);

-- 2. Agregar campo is_featured (productos destacados)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 3. Agregar campo images (array de URLs de imágenes)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT NULL;

-- ═══════════════════════════════════════════════════════════════════════
-- DATOS DE EJEMPLO: Poblar con descuentos y productos destacados
-- ═══════════════════════════════════════════════════════════════════════

-- 5 productos Columbia con 20% de descuento
UPDATE products 
SET discount = 20 
WHERE brand ILIKE '%columbia%' 
  AND is_active = true 
LIMIT 5;

-- 3 pantalones con 15% de descuento
UPDATE products 
SET discount = 15 
WHERE category_id IN (
  SELECT id FROM categories WHERE name ILIKE '%pantalon%'
) 
  AND is_active = true 
LIMIT 3;

-- 4 productos con precio mayor a 400 Bs con 10% de descuento
UPDATE products 
SET discount = 10 
WHERE price > 400 
  AND is_active = true 
  AND discount = 0  -- Solo los que no tienen descuento aún
LIMIT 4;

-- 5 productos recientes marcados como destacados (is_featured)
UPDATE products 
SET is_featured = true 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 5;

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN: Consultas para verificar los cambios
-- ═══════════════════════════════════════════════════════════════════════

-- Ver productos con descuento
-- SELECT name, brand, price, discount, 
--        ROUND(price * (1 - discount::numeric / 100), 2) as precio_con_descuento,
--        ROUND(price * (discount::numeric / 100), 2) as ahorro
-- FROM products 
-- WHERE discount > 0 AND is_active = true
-- ORDER BY discount DESC;

-- Ver productos destacados
-- SELECT name, brand, price, is_featured, created_at
-- FROM products 
-- WHERE is_featured = true AND is_active = true
-- ORDER BY created_at DESC;

-- Estadísticas de descuentos
-- SELECT 
--   COUNT(*) FILTER (WHERE discount > 0) as productos_con_descuento,
--   COUNT(*) FILTER (WHERE is_featured = true) as productos_destacados,
--   AVG(discount) FILTER (WHERE discount > 0) as descuento_promedio
-- FROM products 
-- WHERE is_active = true;
