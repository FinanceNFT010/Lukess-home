# 🔧 SOLUCIÓN: Productos no aparecen en Vercel

## Diagnóstico

✅ Variables de entorno configuradas correctamente en Vercel  
✅ Código funcionando en local  
❌ Error en Vercel: "Error fetching products"

## Problema Real

El problema NO son las variables de entorno (ya están configuradas). El problema es que **Supabase está bloqueando las consultas desde el servidor de Vercel** debido a las políticas RLS (Row Level Security).

## Solución

Necesitas agregar políticas RLS para permitir **lectura pública** de productos e inventario.

### Paso 1: Ir a Supabase SQL Editor

Abre: https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh/sql/new

### Paso 2: Ejecutar este SQL

```sql
-- Permitir lectura pública de productos
CREATE POLICY "Allow public read products" ON products
FOR SELECT TO public
USING (is_active = true);

-- Permitir lectura pública de categorías
CREATE POLICY "Allow public read categories" ON categories
FOR SELECT TO public
USING (true);

-- Permitir lectura pública de inventario
CREATE POLICY "Allow public read inventory" ON inventory
FOR SELECT TO public
USING (true);

-- Permitir lectura pública de locations
CREATE POLICY "Allow public read locations" ON locations
FOR SELECT TO public
USING (true);
```

### Paso 3: Verificar que RLS esté habilitado

En Supabase, ve a **Database → Tables** y verifica que estas tablas tengan RLS habilitado:
- ✅ `products`
- ✅ `categories`
- ✅ `inventory`
- ✅ `locations`

### Paso 4: Esperar 1 minuto y recargar

Una vez ejecutado el SQL, espera 1 minuto y recarga https://lukess-home.vercel.app

---

## ¿Por qué pasa esto?

- **En local**: Supabase permite todo porque estás en desarrollo
- **En Vercel (producción)**: Supabase aplica RLS y bloquea consultas sin políticas
- **Solución**: Agregar políticas RLS para permitir lectura pública de productos

---

## Verificación rápida

Después de ejecutar el SQL, puedes verificar que funciona ejecutando esto en Supabase SQL Editor:

```sql
-- Esto debería devolver tus productos
SELECT * FROM products WHERE is_active = true LIMIT 5;
```

Si devuelve productos, entonces las políticas están correctas.

---

## Alternativa: Deshabilitar RLS temporalmente (NO RECOMENDADO)

Si quieres una solución rápida pero menos segura:

```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
```

⚠️ **NO recomendado para producción** - mejor usa las políticas de arriba.
