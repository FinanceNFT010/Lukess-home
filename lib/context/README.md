# CartContext - Gestión del Carrito de Compras

## Descripción

El `CartContext` proporciona un sistema completo de gestión del carrito de compras con persistencia en `localStorage`. Permite agregar, eliminar, actualizar cantidades y calcular totales de productos en el carrito.

## Características

✅ **Persistencia automática** - El carrito se guarda en `localStorage` y se restaura al recargar la página
✅ **Gestión de variantes** - Soporte para tallas y colores
✅ **Cálculos automáticos** - Total y cantidad de items se calculan automáticamente
✅ **TypeScript** - Completamente tipado para mejor DX

## Uso

### 1. Importar el hook

```typescript
import { useCart } from '@/lib/context/CartContext'
```

### 2. Usar en un componente

```typescript
'use client'

import { useCart } from '@/lib/context/CartContext'
import { Product } from '@/lib/types'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart, itemCount, total } = useCart()

  const handleAddToCart = () => {
    addToCart(product, 1, 'M', 'Azul')
  }

  return (
    <div>
      <h3>{product.name}</h3>
      <p>Bs {product.price}</p>
      <button onClick={handleAddToCart}>
        Agregar al Carrito
      </button>
      
      {/* Mostrar cantidad de items */}
      <p>Items en carrito: {itemCount}</p>
      
      {/* Mostrar total */}
      <p>Total: Bs {total}</p>
    </div>
  )
}
```

## API del CartContext

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `cart` | `CartItem[]` | Array con todos los items del carrito |
| `itemCount` | `number` | Cantidad total de productos (suma de cantidades) |
| `total` | `number` | Precio total del carrito |

### Métodos

#### `addToCart(product, quantity, size?, color?)`

Agrega un producto al carrito o incrementa su cantidad si ya existe.

```typescript
addToCart(product: Product, quantity: number, size?: string, color?: string): void
```

**Ejemplo:**
```typescript
// Sin variantes
addToCart(product, 2)

// Con talla
addToCart(product, 1, 'L')

// Con talla y color
addToCart(product, 1, 'M', 'Negro')
```

#### `removeFromCart(itemId)`

Elimina un item del carrito.

```typescript
removeFromCart(itemId: string): void
```

**Ejemplo:**
```typescript
removeFromCart('prod_123-M-Negro')
```

#### `updateQuantity(itemId, quantity)`

Actualiza la cantidad de un item. Si la cantidad es 0 o menor, elimina el item.

```typescript
updateQuantity(itemId: string, quantity: number): void
```

**Ejemplo:**
```typescript
// Incrementar
updateQuantity(item.id, item.quantity + 1)

// Decrementar
updateQuantity(item.id, item.quantity - 1)

// Establecer cantidad específica
updateQuantity(item.id, 5)
```

#### `clearCart()`

Vacía completamente el carrito.

```typescript
clearCart(): void
```

**Ejemplo:**
```typescript
// Después de confirmar un pedido
const handleCheckout = async () => {
  await createOrder(cart)
  clearCart()
}
```

## Estructura de CartItem

```typescript
interface CartItem {
  id: string           // Generado automáticamente: "productId-size-color"
  product: Product     // Objeto completo del producto
  quantity: number     // Cantidad seleccionada
  size?: string        // Talla opcional
  color?: string       // Color opcional
}
```

## Ejemplo Completo: Página de Carrito

```typescript
'use client'

import { useCart } from '@/lib/context/CartContext'
import { Trash2, Plus, Minus } from 'lucide-react'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart()

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2>Tu carrito está vacío</h2>
        <a href="/catalogo">Ver productos</a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        Carrito de Compras ({itemCount} items)
      </h1>

      {/* Lista de items */}
      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
            {/* Imagen */}
            <img 
              src={item.product.image_url || '/placeholder.png'} 
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded"
            />

            {/* Info */}
            <div className="flex-1">
              <h3 className="font-semibold">{item.product.name}</h3>
              {item.size && <p className="text-sm text-gray-500">Talla: {item.size}</p>}
              {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
              <p className="text-primary-600 font-bold">Bs {item.product.price}</p>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="w-8 text-center font-semibold">
                {item.quantity}
              </span>
              
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right">
              <p className="font-bold">
                Bs {(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>

            {/* Eliminar */}
            <button 
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total:</span>
          <span className="text-3xl font-bold text-primary-600">
            Bs {total.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={clearCart}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Vaciar Carrito
          </button>
          
          <button className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
            Proceder al Pago
          </button>
        </div>
      </div>
    </div>
  )
}
```

## Notas Importantes

⚠️ **Solo Client Components**: El hook `useCart()` solo puede usarse en componentes con `'use client'` en la parte superior.

⚠️ **localStorage**: El carrito se guarda en el navegador del usuario. Si limpia el caché o usa modo incógnito, el carrito se perderá.

⚠️ **ID único**: Cada combinación de producto + talla + color genera un ID único, por lo que el mismo producto con diferentes tallas se trata como items separados.

## Próximos Pasos

- [ ] Agregar límite de stock por producto
- [ ] Implementar descuentos y cupones
- [ ] Sincronizar con backend (Supabase)
- [ ] Agregar notificaciones toast al agregar/eliminar
- [ ] Implementar "Guardar para después"
