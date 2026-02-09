# Configuración de Supabase

## Pasos para configurar la base de datos

### 1. Acceder al SQL Editor de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `lrcggpdgrqltqbxqnjgh`
3. En el menú lateral, haz clic en **SQL Editor**

### 2. Ejecutar el script de órdenes

1. Abre el archivo `schema-orders.sql` en este directorio
2. Copia todo el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl+Enter)

### 3. Verificar las tablas creadas

Después de ejecutar el script, verifica que se hayan creado las siguientes tablas:

#### Tabla `orders`
- `id` (UUID, primary key)
- `customer_name` (TEXT)
- `customer_phone` (TEXT)
- `customer_email` (TEXT, opcional)
- `subtotal` (NUMERIC)
- `discount` (NUMERIC)
- `total` (NUMERIC)
- `status` (TEXT, default: 'pending')
- `payment_method` (TEXT, default: 'qr')
- `payment_proof` (TEXT, opcional)
- `notes` (TEXT, opcional)
- `created_at` (TIMESTAMPTZ)

#### Tabla `order_items`
- `id` (UUID, primary key)
- `order_id` (UUID, foreign key → orders)
- `product_id` (UUID, foreign key → products)
- `quantity` (INTEGER)
- `unit_price` (NUMERIC)
- `size` (TEXT, opcional)
- `color` (TEXT, opcional)
- `subtotal` (NUMERIC)

### 4. Verificar políticas RLS

En el menú lateral, ve a **Authentication > Policies** y verifica que existan las siguientes políticas:

**Para la tabla `orders`:**
- ✅ Allow public insert orders
- ✅ Allow public select orders

**Para la tabla `order_items`:**
- ✅ Allow public insert order_items
- ✅ Allow public select order_items

### 5. Verificar índices

Los siguientes índices deberían estar creados para optimizar las consultas:

- `idx_orders_status` - en la columna `status` de `orders`
- `idx_orders_created_at` - en la columna `created_at` de `orders`
- `idx_order_items_order_id` - en la columna `order_id` de `order_items`
- `idx_order_items_product_id` - en la columna `product_id` de `order_items`

## Notas importantes

⚠️ **Requisito previo:** Este script asume que ya existe una tabla `products` en tu base de datos, ya que `order_items` tiene una foreign key hacia ella.

Si aún no tienes la tabla `products`, deberás crearla primero o ejecutar el script completo del sistema de inventario.

## Conexión desde la aplicación

Las credenciales de conexión ya están configuradas en el archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://lrcggpdgrqltqbxqnjgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
```

Los clientes de Supabase están disponibles en:
- **Cliente browser:** `lib/supabase/client.ts`
- **Cliente server:** `lib/supabase/server.ts`
