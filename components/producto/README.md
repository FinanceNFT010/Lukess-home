# ProductDetail - Página Individual de Producto

Página completa de detalle de producto con información completa, selectores de variantes, y productos relacionados.

## Características

✅ **Información completa del producto**
✅ **Imagen grande** con overlay de sin stock
✅ **Selectores de talla y color** (si aplica)
✅ **Control de cantidad** con límite de stock
✅ **Stock en tiempo real** de todos los puestos
✅ **Validaciones** antes de agregar al carrito
✅ **Botón "Agregar al Carrito"** grande
✅ **Botón "Consultar WhatsApp"** con mensaje pre-llenado
✅ **Breadcrumbs** de navegación
✅ **Productos relacionados** (misma categoría)
✅ **Animaciones** con Framer Motion
✅ **Responsive** completo

---

## Arquitectura

### Server Component: `app/producto/[id]/page.tsx`

```typescript
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Obtener producto por ID
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      inventory(quantity, location_id, locations(name))
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  // 2. Obtener productos relacionados
  const { data: relatedProducts } = await supabase
    .from('products')
    .select(`*, categories(name), inventory(quantity)`)
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', id)
    .limit(4)

  return <ProductDetail product={product} relatedProducts={relatedProducts || []} />
}
```

### Client Component: `components/producto/ProductDetail.tsx`

```typescript
'use client'
export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  
  // Lógica de validación y carrito
}
```

---

## Ruta Dinámica

```
URL: /producto/[id]
Ejemplo: /producto/550e8400-e29b-41d4-a716-446655440000
```

**Parámetros:**
- `id` - UUID del producto en Supabase

**Si no existe:**
- Muestra página 404 de Next.js (`notFound()`)

---

## Secciones de la Página

### 1. Breadcrumbs

```tsx
<div className="bg-gray-50 border-b">
  <Home /> → Catálogo → {product.name}
</div>
```

**Navegación:**
- Home → `/`
- Catálogo → `/#catalogo`
- Producto actual (no clickeable)

### 2. Grid 2 Columnas

#### Columna Izquierda: Imagen
- Aspect ratio cuadrado (1:1)
- Imagen a tamaño completo
- Overlay si no hay stock
- Animación slideIn desde la izquierda

#### Columna Derecha: Información
- Categoría (badge)
- Nombre del producto (H1)
- Precio grande
- Margen de ganancia (si cost > 0)
- Stock disponible
- Descripción
- Marca
- Selectores de talla
- Selectores de color
- Control de cantidad
- Botones de acción

### 3. Productos Relacionados

```typescript
// Misma categoría, máximo 4
.eq('category_id', product.category_id)
.neq('id', id)
.limit(4)
```

**Grid:** 1/2/4 columnas según viewport

---

## Selectores de Variantes

### Tallas

```tsx
{product.sizes && product.sizes.length > 0 && (
  <div>
    <label>Selecciona una talla:</label>
    <div className="flex gap-2">
      {product.sizes.map((size) => (
        <button
          onClick={() => setSelectedSize(size)}
          className={selectedSize === size ? 'bg-primary-600 text-white' : 'bg-gray-100'}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
)}
```

**Validación:**
```typescript
if (product.sizes && product.sizes.length > 0 && !selectedSize) {
  toast.error('Por favor selecciona una talla')
  return
}
```

### Colores

```tsx
{product.colors && product.colors.length > 0 && (
  <div>
    <label>Selecciona un color:</label>
    <div className="flex gap-2">
      {product.colors.map((color) => (
        <button
          onClick={() => setSelectedColor(color)}
          className={selectedColor === color ? 'bg-primary-600 text-white' : 'bg-gray-100'}
        >
          {color}
        </button>
      ))}
    </div>
  </div>
)}
```

---

## Control de Cantidad

```tsx
<div className="flex items-center gap-4">
  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
    −
  </button>
  <span>{quantity}</span>
  <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}>
    +
  </button>
</div>
```

**Límites:**
- Mínimo: 1
- Máximo: stock disponible

---

## Validaciones al Agregar

```typescript
const handleAddToCart = () => {
  // 1. Verificar stock
  if (isOutOfStock) {
    toast.error('Producto sin stock')
    return
  }

  // 2. Verificar talla (si aplica)
  if (product.sizes && product.sizes.length > 0 && !selectedSize) {
    toast.error('Por favor selecciona una talla')
    return
  }

  // 3. Verificar color (si aplica)
  if (product.colors && product.colors.length > 0 && !selectedColor) {
    toast.error('Por favor selecciona un color')
    return
  }

  // 4. Verificar cantidad vs stock
  if (quantity > stock) {
    toast.error(`Solo hay ${stock} unidades disponibles`)
    return
  }

  // 5. Agregar al carrito
  addToCart(product, quantity, selectedSize, selectedColor)
  toast.success(`${quantity}x ${product.name} agregado al carrito`)
}
```

---

## Mensaje de WhatsApp

```typescript
const handleWhatsApp = () => {
  const message = encodeURIComponent(
    `Hola! Estoy interesado en:\n\n` +
    `📦 ${product.name}\n` +
    `💰 Precio: Bs ${product.price.toFixed(2)}\n` +
    `📏 Talla: ${selectedSize || 'A consultar'}\n` +
    `🎨 Color: ${selectedColor || 'A consultar'}\n\n` +
    `¿Tienen disponible?`
  )
  window.open(`https://wa.me/59176020369?text=${message}`, '_blank')
}
```

**Incluye:**
- Nombre del producto
- Precio
- Talla seleccionada (o "A consultar")
- Color seleccionado (o "A consultar")

---

## Cálculo de Stock

```typescript
const getTotalStock = (p: Product): number => {
  return p.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
}
```

**Suma de todos los puestos:**
```
Puesto 1: 5 unidades
Puesto 2: 3 unidades
Puesto 3: 2 unidades
Total: 10 unidades
```

---

## Cálculo de Margen

```typescript
const margin = product.cost > 0 
  ? ((product.price - product.cost) / product.cost * 100).toFixed(1)
  : '0'
```

**Ejemplo:**
- Precio: Bs 300
- Costo: Bs 200
- Margen: (300-200)/200 * 100 = **50%**

---

## Estados Visuales

### Sin Stock
```tsx
{isOutOfStock && (
  <div className="absolute inset-0 bg-black/60">
    <span className="bg-red-600 text-white">Sin Stock</span>
  </div>
)}
```

### Pocas Unidades
```tsx
{stock < 5 && (
  <span className="text-red-600">
    {stock} unidades
  </span>
)}
```

### Con Stock
```tsx
{stock >= 5 && (
  <span className="text-green-600">
    {stock} unidades
  </span>
)}
```

---

## Productos Relacionados

```typescript
const { data: relatedProducts } = await supabase
  .from('products')
  .select(`*, categories(name), inventory(quantity)`)
  .eq('category_id', product.category_id)
  .eq('is_active', true)
  .neq('id', id)
  .limit(4)
```

**Criterios:**
- ✅ Misma categoría
- ✅ Productos activos
- ✅ Excluye el producto actual
- ✅ Máximo 4 productos

**Grid:** 1 → 2 → 4 columnas

---

## Animaciones

### Imagen
```typescript
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
```

### Información
```typescript
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
```

---

## Responsive

### Mobile
- 1 columna (imagen arriba, info abajo)
- Botones full width
- Breadcrumbs compactos

### Desktop
- 2 columnas (imagen izq, info der)
- Botones lado a lado
- Breadcrumbs expandidos

---

## SEO

### Metadata Dinámica (TODO)

```typescript
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('name, description, price, image_url')
    .eq('id', id)
    .single()

  if (!product) return {}

  return {
    title: `${product.name} - Lukess Home`,
    description: product.description || `Compra ${product.name} en Lukess Home`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: [product.image_url || '/og-image.png'],
    },
  }
}
```

---

## Ejemplo de Flujo

### 1. Usuario busca "camisa azul"
```
SearchBar → Click en resultado → /producto/abc-123
```

### 2. Usuario ve el producto
```
- Imagen grande
- Precio: Bs 250
- Stock: 8 unidades
- Tallas: S, M, L, XL
- Colores: Azul, Blanco
```

### 3. Usuario selecciona opciones
```
- Talla: M
- Color: Azul
- Cantidad: 2
```

### 4. Usuario agrega al carrito
```
Click "Agregar al Carrito"
→ Validaciones
→ addToCart(product, 2, 'M', 'Azul')
→ Toast: "2x Camisa Azul agregado al carrito"
```

### 5. Usuario ve productos relacionados
```
Grid con 4 productos de la misma categoría
Click en uno → Nueva página de producto
```

---

## Notificaciones Toast

```typescript
// Éxito
toast.success(`${quantity}x ${product.name} agregado al carrito`)

// Errores
toast.error('Producto sin stock')
toast.error('Por favor selecciona una talla')
toast.error('Por favor selecciona un color')
toast.error(`Solo hay ${stock} unidades disponibles`)
```

---

## Props

```typescript
interface ProductDetailProps {
  product: Product           // Producto principal
  relatedProducts: Product[] // Productos relacionados
}
```

---

## 📊 Estado del Proyecto:

```bash
✅ Error de Vercel solucionado
✅ Cliente de Supabase con lazy loading
✅ Página de producto creada (/producto/[id])
✅ ProductDetail component completo
✅ Breadcrumbs de navegación
✅ Selectores de talla y color
✅ Control de cantidad
✅ Validaciones completas
✅ Productos relacionados
✅ Integración con carrito
✅ WhatsApp con mensaje personalizado
✅ Sin errores de compilación
✅ Build exitoso
```

---

## 🔧 Solución del Error de Vercel:

### Problema Original
```typescript
// ❌ Malo: Se ejecuta en build time
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Solución Implementada
```typescript
// ✅ Bueno: Solo se ejecuta en browser
export const supabase = typeof window !== 'undefined' 
  ? getSupabaseClient() 
  : null as any
```

**Ventajas:**
- ✅ No se ejecuta durante el build
- ✅ Solo se crea en el navegador
- ✅ Singleton pattern (una sola instancia)
- ✅ Validación de variables de entorno

---

## Próximas Mejoras

- [ ] Agregar galería de imágenes múltiples
- [ ] Implementar zoom en imagen
- [ ] Agregar reseñas de clientes
- [ ] Mostrar ubicación del stock por puesto
- [ ] Agregar botón "Comprar ahora" (checkout directo)
- [ ] Implementar compartir en redes sociales
- [ ] Agregar "Agregar a favoritos"
- [ ] Mostrar historial de precios
- [ ] Agregar metadata dinámica para SEO

---

## Notas de Implementación

⚠️ **Params Async:** Next.js 15+ requiere `await params` en dynamic routes.

⚠️ **notFound():** Muestra la página 404 de Next.js si el producto no existe.

⚠️ **Stock Real:** Se calcula sumando el inventario de todos los puestos.

⚠️ **Placeholder:** Usa `/placeholder.png` si no hay imagen. Asegúrate de que exista.
