# CatalogoClient - Catálogo Conectado con Supabase

Componente client-side que muestra productos del sistema de inventario de Supabase con funcionalidad completa de carrito de compras.

## Cambios Principales

### ✅ Antes (Hardcodeado)
- Productos definidos en `lib/products.ts`
- 11 productos estáticos
- Sin stock real
- Sin integración con inventario

### ✅ Ahora (Dinámico)
- Productos desde Supabase
- Stock en tiempo real
- Integración con sistema de inventario
- Botón "Agregar al Carrito" funcional

---

## Arquitectura

### Server Component: `app/page.tsx`

```typescript
export default async function Home() {
  const supabase = await createClient()
  
  // Fetch productos activos
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      inventory(
        quantity,
        location_id,
        locations(name)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  return (
    <>
      <HeroSection />
      <PuestosSection />
      <CatalogoClient initialProducts={products || []} />
      {/* ... */}
    </>
  )
}
```

**Ventajas:**
- ✅ Fetch en el servidor (mejor SEO)
- ✅ Datos frescos en cada carga
- ✅ No expone credenciales al cliente
- ✅ Mejor performance inicial

### Client Component: `components/home/CatalogoClient.tsx`

```typescript
'use client'
export function CatalogoClient({ initialProducts }: CatalogoClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const { addToCart } = useCart()
  
  // Lógica de filtrado y carrito
}
```

**Ventajas:**
- ✅ Interactividad (filtros, carrito)
- ✅ Animaciones con Framer Motion
- ✅ Toast notifications
- ✅ Gestión de estado local

---

## Características

### 1. Filtrado por Categoría

```typescript
// Extrae categorías únicas de los productos
const categories = useMemo(() => {
  const cats = new Set<string>()
  initialProducts.forEach(p => {
    if (p.categories?.name) cats.add(p.categories.name)
  })
  return ['Todos', ...Array.from(cats).sort()]
}, [initialProducts])

// Filtra productos según categoría seleccionada
const filteredProducts = useMemo(() => {
  if (selectedCategory === 'Todos') return initialProducts
  return initialProducts.filter(p => p.categories?.name === selectedCategory)
}, [selectedCategory, initialProducts])
```

### 2. Cálculo de Stock

```typescript
const getTotalStock = (product: Product): number => {
  return product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
}
```

**Stock se suma de todos los locations:**
- Puesto 1: 5 unidades
- Puesto 2: 3 unidades
- Puesto 3: 2 unidades
- **Total: 10 unidades**

### 3. Badges de Stock

```typescript
{isOutOfStock ? (
  <span className="bg-red-600 text-white">Sin Stock</span>
) : stock < 5 ? (
  <span className="bg-amber-500 text-white">Últimas {stock}</span>
) : null}
```

**Estados:**
- 🔴 **Sin Stock** - stock === 0
- 🟡 **Últimas X** - stock < 5
- ⚪ **Sin badge** - stock >= 5

### 4. Agregar al Carrito

```typescript
const handleAddToCart = (product: Product) => {
  const stock = getTotalStock(product)
  if (stock === 0) {
    toast.error('Producto sin stock')
    return
  }
  
  addToCart(product, 1)
  toast.success(`${product.name} agregado al carrito`)
}
```

**Validaciones:**
- ✅ Verifica stock antes de agregar
- ✅ Muestra toast de error si no hay stock
- ✅ Muestra toast de éxito al agregar
- ✅ Botón deshabilitado si no hay stock

### 5. Consulta por WhatsApp

```typescript
const handleWhatsAppConsult = (product: Product) => {
  const message = encodeURIComponent(
    `Hola! Estoy interesado en:\n\n` +
    `📦 ${product.name}\n` +
    `💰 Precio: Bs ${product.price.toFixed(2)}\n\n` +
    `¿Tienen disponible?`
  )
  window.open(`https://wa.me/59176020369?text=${message}`, '_blank')
}
```

---

## Query de Supabase

```sql
SELECT 
  products.*,
  categories.name as category_name,
  inventory.quantity,
  inventory.location_id,
  locations.name as location_name
FROM products
LEFT JOIN categories ON products.category_id = categories.id
LEFT JOIN inventory ON products.id = inventory.product_id
LEFT JOIN locations ON inventory.location_id = locations.id
WHERE products.is_active = true
ORDER BY products.created_at DESC
```

**Estructura de datos:**
```typescript
{
  id: string,
  sku: string,
  name: string,
  description: string | null,
  price: number,
  cost: number,
  brand: string | null,
  sizes: string[] | null,
  colors: string[] | null,
  image_url: string | null,
  is_active: boolean,
  category_id: string | null,
  created_at: string,
  categories: {
    name: string
  },
  inventory: [{
    quantity: number,
    location_id: string,
    locations: {
      name: string
    }
  }]
}
```

---

## Botones de Acción

### Desktop (Hover Overlay)
```tsx
<div className="opacity-0 group-hover:opacity-100">
  <button onClick={() => handleAddToCart(product)}>
    <ShoppingCart /> Agregar
  </button>
  <button onClick={() => handleWhatsAppConsult(product)}>
    <MessageCircle /> Consultar
  </button>
</div>
```

### Mobile (Botones Fijos)
```tsx
<div className="lg:hidden flex gap-2">
  <button onClick={() => handleAddToCart(product)}>
    <ShoppingCart /> Agregar
  </button>
  <button onClick={() => handleWhatsAppConsult(product)}>
    <MessageCircle />
  </button>
</div>
```

---

## Animaciones

### Entrada de Sección
```typescript
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}
```

### Cards de Productos
```typescript
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}
```

### Cambio de Categoría
```tsx
<AnimatePresence mode="popLayout">
  <motion.div key={selectedCategory} layout>
    {/* productos */}
  </motion.div>
</AnimatePresence>
```

---

## Responsive

### Grid Breakpoints
```css
grid-cols-1           /* Mobile: 1 columna */
sm:grid-cols-2        /* Tablet: 2 columnas */
lg:grid-cols-3        /* Desktop: 3 columnas */
xl:grid-cols-4        /* Large: 4 columnas */
```

### Botones
- **Desktop:** Overlay con hover
- **Mobile:** Botones fijos debajo del producto

---

## Integración con CartContext

```typescript
import { useCart } from '@/lib/context/CartContext'

const { addToCart } = useCart()

// Agregar producto
addToCart(product, 1)  // cantidad: 1
```

**El CartContext maneja:**
- ✅ Persistencia en localStorage
- ✅ Cálculo de totales
- ✅ Gestión de cantidades
- ✅ Variantes (tallas/colores)

---

## Notificaciones Toast

```typescript
import toast from 'react-hot-toast'

// Éxito
toast.success(`${product.name} agregado al carrito`)

// Error
toast.error('Producto sin stock')
```

**Configuración en layout.tsx:**
```tsx
<Toaster position="top-right" />
```

---

## Placeholder de Imagen

Si un producto no tiene imagen:
```typescript
src={product.image_url || '/placeholder.png'}
```

**Asegúrate de tener:**
- `/public/placeholder.png` para productos sin imagen

---

## Ejemplo de Producto Completo

```typescript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  sku: "CAM-001",
  name: "Camisa Casual Azul",
  description: "Camisa de algodón 100% en tono azul marino",
  price: 250.00,
  cost: 150.00,
  brand: "Lukess",
  sizes: ["S", "M", "L", "XL"],
  colors: ["Azul", "Blanco"],
  image_url: "/products/camisa-azul.png",
  is_active: true,
  category_id: "cat-001",
  created_at: "2024-01-15T10:30:00Z",
  categories: {
    name: "Camisas"
  },
  inventory: [
    {
      quantity: 5,
      location_id: "loc-001",
      locations: { name: "Puesto 1" }
    },
    {
      quantity: 3,
      location_id: "loc-002",
      locations: { name: "Puesto 2" }
    }
  ]
}
```

**Stock total:** 5 + 3 = 8 unidades

---

## Archivos Eliminados

- ❌ `lib/products.ts` - Ya no se usa
- ❌ `components/home/CatalogoSection.tsx` - Reemplazado por CatalogoClient

---

## Próximas Mejoras

- [ ] Agregar búsqueda de productos
- [ ] Implementar ordenamiento (precio, nombre, stock)
- [ ] Agregar vista de lista además de grid
- [ ] Implementar paginación o infinite scroll
- [ ] Agregar filtros por precio, talla, color
- [ ] Mostrar productos relacionados
- [ ] Agregar vista rápida (quick view)
- [ ] Implementar wishlist/favoritos

---

## Notas de Implementación

⚠️ **Server Component:** El fetch se hace en `app/page.tsx` como Server Component para mejor SEO.

⚠️ **Client Component:** La interactividad (filtros, carrito) se maneja en `CatalogoClient.tsx`.

⚠️ **Stock Real:** El stock se calcula sumando todas las ubicaciones del inventario.

⚠️ **Productos Activos:** Solo se muestran productos con `is_active = true`.

⚠️ **Orden:** Los productos se ordenan por fecha de creación (más recientes primero).
