-- ═══════════════════════════════════════════════════════════════════════
-- DIAGNÓSTICO COMPLETO DE SUPABASE
-- Ejecuta este script línea por línea en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- 1. ¿Cuántos productos hay?
SELECT COUNT(*) as total_productos FROM products;

-- 2. ¿Cuántos productos activos?
SELECT COUNT(*) as productos_activos FROM products WHERE is_active = true;

-- 3. Ver los primeros 3 productos
SELECT id, name, price, is_active FROM products LIMIT 3;

-- 4. ¿Existe la tabla categories?
SELECT COUNT(*) as total_categorias FROM categories;

-- 5. ¿Existe la tabla inventory?
SELECT COUNT(*) as total_inventario FROM inventory;

-- 6. ¿Existe la tabla locations?
SELECT COUNT(*) as total_ubicaciones FROM locations;

-- 7. Verificar RLS en products
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'inventory', 'locations');

-- 8. Ver políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('products', 'categories', 'inventory', 'locations')
ORDER BY tablename, policyname;

-- 9. Probar la consulta exacta que hace la app
SELECT 
    p.*,
    c.name as category_name,
    i.quantity,
    i.location_id,
    l.name as location_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN locations l ON i.location_id = l.id
WHERE p.is_active = true
ORDER BY p.created_at DESC
LIMIT 5;

-- ═══════════════════════════════════════════════════════════════════════
-- EJECUTA CADA QUERY Y COPIA LOS RESULTADOS
-- ═══════════════════════════════════════════════════════════════════════
