-- ═══════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar campos de descuentos, colecciones y subcategorías
-- Fecha: 2026-02-11
-- Descripción: Agrega campos para filtros avanzados, colecciones y badges
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

-- 4. Agregar campo is_new (para badge "NUEVO")
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

-- 5. Agregar campo collection (para colecciones: primavera, verano, etc.)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS collection TEXT DEFAULT NULL;

-- 6. Agregar campo subcategory (manga larga, oversize, elegante, etc.)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS subcategory TEXT DEFAULT NULL;

-- ═══════════════════════════════════════════════════════════════════════
-- DATOS DE EJEMPLO: Poblar con descuentos y productos destacados
-- ═══════════════════════════════════════════════════════════════════════

-- 5 productos Columbia con 20% de descuento
UPDATE products 
SET discount = 20 
WHERE id IN (
  SELECT id FROM products 
  WHERE brand ILIKE '%columbia%' 
    AND is_active = true 
  LIMIT 5
);

-- 3 pantalones con 15% de descuento
UPDATE products 
SET discount = 15 
WHERE id IN (
  SELECT id FROM products
  WHERE category_id IN (
    SELECT id FROM categories WHERE name ILIKE '%pantalon%'
  ) 
    AND is_active = true 
  LIMIT 3
);

-- 4 productos con precio mayor a 400 Bs con 10% de descuento
UPDATE products 
SET discount = 10 
WHERE id IN (
  SELECT id FROM products
  WHERE price > 400 
    AND is_active = true 
    AND discount = 0
  LIMIT 4
);

-- 5 productos recientes marcados como destacados (is_featured)
UPDATE products 
SET is_featured = true 
WHERE id IN (
  SELECT id FROM products
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 5
);

-- ═══════════════════════════════════════════════════════════════════════
-- COLECCIÓN PRIMAVERA: 4 productos nuevos marcados como is_new y collection='primavera'
-- ═══════════════════════════════════════════════════════════════════════

-- Marcar 4 productos como NUEVOS y de la colección primavera
UPDATE products 
SET is_new = true, collection = 'primavera'
WHERE id IN (
  SELECT id FROM products
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 4
);

-- ═══════════════════════════════════════════════════════════════════════
-- SUBCATEGORÍAS: Asignar subcategorías a productos existentes
-- ═══════════════════════════════════════════════════════════════════════

-- Camisas manga larga (productos con "manga larga" en nombre o descripción)
UPDATE products 
SET subcategory = 'manga-larga'
WHERE id IN (
  SELECT id FROM products
  WHERE (name ILIKE '%manga larga%' OR description ILIKE '%manga larga%')
    AND is_active = true
);

-- Camisas manga corta
UPDATE products 
SET subcategory = 'manga-corta'
WHERE id IN (
  SELECT id FROM products
  WHERE (name ILIKE '%manga corta%' OR description ILIKE '%manga corta%')
    AND is_active = true
);

-- Camisas elegantes
UPDATE products 
SET subcategory = 'elegante'
WHERE id IN (
  SELECT id FROM products
  WHERE (name ILIKE '%elegante%' OR name ILIKE '%formal%' OR description ILIKE '%elegante%')
    AND is_active = true
    AND subcategory IS NULL
);

-- Pantalones oversize
UPDATE products 
SET subcategory = 'oversize'
WHERE id IN (
  SELECT id FROM products
  WHERE (name ILIKE '%oversize%' OR description ILIKE '%oversize%')
    AND is_active = true
);

-- Pantalones jeans
UPDATE products 
SET subcategory = 'jeans'
WHERE id IN (
  SELECT id FROM products
  WHERE (name ILIKE '%jean%' OR name ILIKE '%denim%' OR description ILIKE '%jean%')
    AND is_active = true
);

-- Pantalones elegantes
UPDATE products 
SET subcategory = 'elegante'
WHERE id IN (
  SELECT id FROM products
  WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%pantalon%')
    AND (name ILIKE '%elegante%' OR name ILIKE '%formal%' OR name ILIKE '%vestir%')
    AND is_active = true
    AND subcategory IS NULL
);

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
