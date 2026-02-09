# Componentes del Carrito

Esta carpeta contiene los componentes relacionados con el carrito de compras de la landing page.

## Componentes

### 1. CartButton.tsx

Botón del carrito que muestra un badge con la cantidad de items.

**Características:**
- ✅ Badge animado con la cantidad de items
- ✅ Solo aparece cuando hay items en el carrito
- ✅ Animación bounce en el badge
- ✅ Icono de ShoppingCart de Lucide
- ✅ Responsive y accesible

**Props:**
```typescript
interface CartButtonProps {
  onClick: () => void  // Función para abrir el drawer
}
```

**Uso:**
```tsx
import { CartButton } from '@/components/cart/CartButton'

<CartButton onClick={() => setIsCartOpen(true)} />
```

**Ubicación actual:**
- Navbar desktop (siempre visible)
- Navbar mobile (dentro del menú hamburguesa)

---

### 2. CartDrawer.tsx

Drawer lateral que muestra el contenido del carrito con todas las funcionalidades.

**Características:**
- ✅ Animación slide desde la derecha
- ✅ Overlay oscuro con blur
- ✅ Lista de productos con imágenes
- ✅ Controles de cantidad (+/-)
- ✅ Botón para eliminar items
- ✅ Cálculo automático del total
- ✅ Estado vacío con mensaje
- ✅ Botón "Proceder al Pago"
- ✅ Responsive (full width en mobile, 384px en desktop)

**Props:**
```typescript
interface CartDrawerProps {
  isOpen: boolean           // Estado de apertura del drawer
  onClose: () => void       // Función para cerrar el drawer
  onCheckout: () => void    // Función al hacer clic en "Proceder al Pago"
}
```

**Uso:**
```tsx
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useState } from 'react'

function MyComponent() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsCartOpen(true)}>
        Abrir Carrito
      </button>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCheckoutOpen(true)
          // Aquí puedes redirigir a la página de checkout
        }}
      />
    </>
  )
}
```

---

## Estructura del CartDrawer

### Header
- Título "Mi Carrito"
- Badge con cantidad de items
- Botón de cerrar (X)
- Fondo primary-600

### Body (Scrollable)
- **Estado vacío:**
  - Icono de bolsa grande
  - Mensaje "Carrito vacío"
  - Subtítulo "Agrega productos para comenzar"

- **Con items:**
  - Card por cada item con:
    - Imagen del producto (80x80px)
    - Nombre del producto
    - Badges de talla y color (si aplica)
    - Precio unitario
    - Controles de cantidad
    - Botón eliminar

### Footer (Solo si hay items)
- Total del carrito (grande y destacado)
- Botón "Proceder al Pago" (gradient primary)

---

## Integración con CartContext

Ambos componentes usan el hook `useCart()` para acceder al estado global del carrito:

```typescript
const { 
  cart,           // Array de items
  itemCount,      // Cantidad total de items
  total,          // Total en Bs
  updateQuantity, // Actualizar cantidad
  removeFromCart  // Eliminar item
} = useCart()
```

---

## Estilos y Animaciones

### CartButton
- Transición suave en hover
- Badge con `animate-bounce` de Tailwind
- Colores: accent-500 para el badge

### CartDrawer
- Animación spring de Framer Motion
- Overlay con fade in/out
- Drawer slide desde la derecha
- Transiciones suaves en todos los botones

---

## Ejemplo Completo: Navbar con Carrito

```tsx
'use client'
import { useState } from 'react'
import { CartButton } from '@/components/cart/CartButton'
import { CartDrawer } from '@/components/cart/CartDrawer'

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
    // Redirigir a /checkout o abrir modal de checkout
    // router.push('/checkout')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div>Logo</div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <CartButton onClick={() => setIsCartOpen(true)} />
            
            {/* WhatsApp */}
            <a href="https://wa.me/...">WhatsApp</a>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </>
  )
}
```

---

## Próximas Mejoras

- [ ] Agregar animación al agregar items (toast notification)
- [ ] Implementar "Guardar para después"
- [ ] Agregar cupones de descuento
- [ ] Mostrar tiempo estimado de entrega
- [ ] Agregar recomendaciones de productos
- [ ] Implementar "Comprar ahora" (checkout rápido)
- [ ] Agregar límite de stock por producto
- [ ] Sincronizar con backend (Supabase)

---

## Notas de Implementación

⚠️ **Z-index:** El CartDrawer usa `z-50` para estar por encima del Navbar (`z-50`) pero el overlay usa `z-50` también. Asegúrate de que no haya conflictos con otros componentes.

⚠️ **Scroll Lock:** Considera agregar `overflow: hidden` al body cuando el drawer esté abierto para prevenir scroll del fondo.

⚠️ **Placeholder Image:** El drawer usa `/placeholder.png` cuando no hay imagen. Asegúrate de que este archivo exista o maneja el error de imagen.

⚠️ **Mobile UX:** En mobile, el drawer ocupa todo el ancho. Considera si quieres mantener este comportamiento o usar un ancho fijo.
