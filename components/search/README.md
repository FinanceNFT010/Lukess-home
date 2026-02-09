# SearchBar - Buscador Global de Productos

Barra de búsqueda en tiempo real que busca productos en el sistema de inventario de Supabase.

## Características

✅ **Búsqueda en tiempo real** - Resultados mientras escribes
✅ **Debounce de 300ms** - Optimiza las queries a Supabase
✅ **Mínimo 2 caracteres** - Evita búsquedas vacías
✅ **Máximo 5 resultados** - Dropdown compacto
✅ **Búsqueda inteligente** - Busca en nombre, SKU y marca
✅ **Click fuera para cerrar** - UX intuitiva
✅ **Loading spinner** - Feedback visual
✅ **Stock en tiempo real** - Muestra disponibilidad
✅ **Animaciones suaves** - Framer Motion
✅ **Responsive** - Adaptado a mobile y desktop

---

## Ubicación

### Desktop
- Centro del Navbar
- Entre logo y links de navegación
- Max-width: 448px (max-w-md)
- Siempre visible

### Mobile
- Oculto por ahora (puede agregarse como modal)

---

## Query de Búsqueda

```typescript
const { data } = await supabase
  .from('products')
  .select(`
    *,
    categories(name),
    inventory(quantity)
  `)
  .or(`name.ilike.%${query}%,sku.ilike.%${query}%,brand.ilike.%${query}%`)
  .eq('is_active', true)
  .limit(5)
```

**Busca en:**
- ✅ `name` - Nombre del producto
- ✅ `sku` - Código del producto
- ✅ `brand` - Marca del producto

**Operador:** `ilike` (case-insensitive LIKE)

**Ejemplo:**
- Query: "camisa"
- Encuentra: "Camisa Azul", "CAMISA Roja", "camisa blanca"

---

## Estados del Componente

```typescript
const [query, setQuery] = useState('')              // Texto de búsqueda
const [results, setResults] = useState<Product[]>([]) // Resultados
const [isOpen, setIsOpen] = useState(false)         // Dropdown abierto
const [isLoading, setIsLoading] = useState(false)   // Cargando
```

---

## Debounce de Búsqueda

```typescript
useEffect(() => {
  if (query.length < 2) {
    setResults([])
    setIsOpen(false)
    return
  }

  setIsLoading(true)
  
  const searchProducts = async () => {
    // ... query a Supabase ...
  }

  const debounce = setTimeout(searchProducts, 300)
  return () => clearTimeout(debounce)
}, [query])
```

**Ventajas del debounce:**
- ⏱️ Espera 300ms después del último keystroke
- 🚀 Reduce queries innecesarias a Supabase
- 💰 Ahorra costos de API
- ⚡ Mejor performance

---

## Click Fuera para Cerrar

```typescript
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
```

---

## Dropdown de Resultados

### Estructura

```tsx
<motion.div className="absolute top-full mt-2 w-full">
  {results.map((product) => (
    <button onClick={() => handleProductClick(product.id)}>
      {/* Imagen */}
      <Image src={product.image_url} width={48} height={48} />
      
      {/* Info */}
      <div>
        <p>{product.name}</p>
        <p>Bs {product.price}</p>
        <p>Stock: {stock}</p>
      </div>
      
      {/* Arrow */}
      <svg>→</svg>
    </button>
  ))}
</motion.div>
```

### Animación

```typescript
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
```

---

## Navegación a Detalle

```typescript
const handleProductClick = (productId: string) => {
  router.push(`/producto/${productId}`)
  setQuery('')
  setIsOpen(false)
}
```

**Nota:** Esto asume que existe una ruta `/producto/[id]`. Si no existe, puedes:
- Crear la página de detalle
- O cambiar a scroll al producto en el catálogo
- O abrir modal de detalle

---

## Estados Visuales

### Input
```css
/* Normal */
border-2 border-gray-200

/* Focus */
focus:border-primary-500

/* Con texto */
pr-10  /* Espacio para botón X */
```

### Loading
```tsx
{isLoading && (
  <Loader2 className="animate-spin text-primary-500" />
)}
```

### Botón Limpiar
```tsx
{query && (
  <button onClick={() => { setQuery(''); setResults([]); }}>
    <X className="w-5 h-5" />
  </button>
)}
```

### No Results
```tsx
{query.length >= 2 && results.length === 0 && !isLoading && (
  <div>No se encontraron productos</div>
)}
```

---

## Ejemplo de Uso

```tsx
import { SearchBar } from '@/components/search/SearchBar'

export default function Navbar() {
  return (
    <nav>
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Logo />
        
        {/* SearchBar */}
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>
        
        {/* Actions */}
        <CartButton />
        <WhatsAppButton />
      </div>
    </nav>
  )
}
```

---

## Optimizaciones

### 1. Debounce
```typescript
setTimeout(searchProducts, 300)
```
Espera 300ms después del último keystroke

### 2. Limit
```typescript
.limit(5)
```
Solo muestra 5 resultados

### 3. Índices en Supabase
Asegúrate de tener índices en:
- `products.name`
- `products.sku`
- `products.brand`

```sql
CREATE INDEX idx_products_name ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_brand ON products(brand);
```

---

## Accesibilidad

```tsx
// Input
placeholder="Buscar productos..."
type="text"

// Botón limpiar
aria-label="Limpiar búsqueda"

// Resultados
role="listbox"
aria-label="Resultados de búsqueda"
```

---

## Próximas Mejoras

- [ ] Agregar modal de búsqueda para mobile
- [ ] Implementar búsqueda por categoría
- [ ] Agregar historial de búsquedas
- [ ] Implementar búsqueda por voz
- [ ] Agregar sugerencias de búsqueda
- [ ] Mostrar productos populares al abrir
- [ ] Agregar filtros avanzados
- [ ] Implementar búsqueda fuzzy
- [ ] Agregar keyboard navigation (↑↓ Enter)
- [ ] Destacar texto coincidente

---

## Integración con Navbar

### Desktop
```tsx
<div className="flex items-center gap-4">
  <Logo />
  
  {/* SearchBar en el centro */}
  <div className="flex-1 max-w-md">
    <SearchBar />
  </div>
  
  <NavLinks />
  <CartButton />
  <WhatsAppButton />
</div>
```

### Layout
```css
/* Logo: shrink-0 (no se encoge) */
/* SearchBar: flex-1 max-w-md (crece hasta 448px) */
/* Links: hidden lg:flex (solo desktop) */
/* Actions: flex gap-3 (siempre visible) */
```

---

## Performance

### Query Optimization
```typescript
// ✅ Bueno: Búsqueda específica con limit
.or(`name.ilike.%${query}%,sku.ilike.%${query}%,brand.ilike.%${query}%`)
.limit(5)

// ❌ Malo: Fetch todos y filtrar en cliente
.select('*')
// ... filtrar en JavaScript
```

### Debounce
```typescript
// ✅ Bueno: Espera 300ms
setTimeout(searchProducts, 300)

// ❌ Malo: Query en cada keystroke
onChange={(e) => searchProducts(e.target.value)}
```

---

## Notas de Implementación

⚠️ **Página de Detalle:** El SearchBar navega a `/producto/[id]`. Asegúrate de crear esta ruta o cambiar la navegación.

⚠️ **Índices:** Para mejor performance, crea índices GIN en las columnas de búsqueda.

⚠️ **Mobile:** Actualmente solo visible en desktop (lg:flex). Considera agregar modal de búsqueda para mobile.

⚠️ **Placeholder Image:** Usa `/placeholder.png` si no hay imagen. Asegúrate de que exista.
