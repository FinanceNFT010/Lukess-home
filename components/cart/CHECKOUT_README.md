# CheckoutModal - Proceso de Pago con QR

Modal de checkout completo con 3 pasos: formulario de datos, pago con QR, y confirmación exitosa.

## Características

✅ **3 Pasos del Proceso:**
1. **Formulario** - Captura datos del cliente
2. **QR de Pago** - Muestra QR de Yolo Pago
3. **Confirmación** - Mensaje de éxito y WhatsApp automático

✅ **Validaciones:**
- Nombre y teléfono requeridos
- Validación de teléfono boliviano (7-8 dígitos)
- Email opcional

✅ **Integración con Supabase:**
- Crea orden en tabla `orders`
- Crea items en tabla `order_items`
- Manejo de errores completo

✅ **Notificaciones:**
- Toast de éxito/error con react-hot-toast
- Mensajes claros para el usuario

✅ **WhatsApp Automático:**
- Al confirmar pago, abre WhatsApp con mensaje pre-llenado
- Incluye número de orden y total

✅ **Limpieza Automática:**
- Limpia el carrito después de confirmar
- Resetea el formulario
- Cierra el modal

---

## Props

```typescript
interface CheckoutModalProps {
  isOpen: boolean      // Estado de apertura del modal
  onClose: () => void  // Función para cerrar el modal
}
```

---

## Uso

```tsx
import { CheckoutModal } from '@/components/cart/CheckoutModal'
import { useState } from 'react'

function MyComponent() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsCheckoutOpen(true)}>
        Proceder al Pago
      </button>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  )
}
```

---

## Flujo del Usuario

### 1️⃣ Paso 1: Formulario de Datos

**Campos:**
- **Nombre Completo** (requerido)
- **Teléfono WhatsApp** (requerido, 7-8 dígitos)
- **Email** (opcional)

**Validaciones:**
```typescript
// Teléfono: 7-8 dígitos
const phoneRegex = /^\d{7,8}$/

// Ejemplos válidos:
// 76020369 ✓
// 7602036 ✓
// 760203 ✗ (muy corto)
```

**Al enviar:**
1. Valida campos
2. Crea orden en Supabase
3. Crea items de la orden
4. Muestra toast de éxito
5. Avanza al paso 2 (QR)

---

### 2️⃣ Paso 2: Pago con QR

**Muestra:**
- Número de orden (primeros 8 caracteres)
- QR de Yolo Pago (280x280px)
- Total a pagar (destacado)
- Mensaje de instrucciones
- Botón "Ya Pagué"

**QR de Yolo Pago:**
```
Ubicación: /public/qr-yolo-pago.png
Tamaño: 280x280px
Formato: PNG
```

**Al hacer clic en "Ya Pagué":**
1. Avanza al paso 3
2. Abre WhatsApp en nueva pestaña
3. Mensaje pre-llenado con datos de la orden

---

### 3️⃣ Paso 3: Confirmación Exitosa

**Muestra:**
- Icono de check animado (scale spring)
- Mensaje "¡Orden Confirmada!"
- Número de orden
- Mensaje de seguimiento por WhatsApp

**Después de 2 segundos:**
1. Limpia el carrito (`clearCart()`)
2. Cierra el modal
3. Resetea el formulario
4. Vuelve al paso 1

---

## Estructura de la Orden en Supabase

### Tabla `orders`

```sql
{
  id: UUID,
  customer_name: string,
  customer_phone: string,
  customer_email: string | null,
  subtotal: number,
  discount: number,
  total: number,
  status: 'pending',
  payment_method: 'qr',
  created_at: timestamp
}
```

### Tabla `order_items`

```sql
{
  id: UUID,
  order_id: UUID (FK),
  product_id: UUID (FK),
  quantity: number,
  unit_price: number,
  size: string | null,
  color: string | null,
  subtotal: number
}
```

---

## Mensaje de WhatsApp

Cuando el usuario confirma el pago, se abre WhatsApp con este mensaje:

```
Hola! Realicé un pedido #A1B2C3D4

📦 Total: Bs 450.00
🛍️ Items: 3

Ya realicé el pago por QR. ¿Pueden confirmar?
```

**Número de WhatsApp:** 59176020369

---

## Notificaciones Toast

### Errores

```typescript
// Campos vacíos
toast.error('Por favor completa nombre y teléfono')

// Teléfono inválido
toast.error('Número de teléfono inválido (ej: 76020369)')

// Error de Supabase
toast.error('Error al crear la orden: ' + error.message)
```

### Éxito

```typescript
// Orden creada
toast.success('Orden creada exitosamente')
```

---

## Estilos y Animaciones

### Modal
```typescript
// Entrada
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}

// Salida
exit={{ scale: 0.9, opacity: 0 }}
```

### Overlay
```typescript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="bg-black/60"
```

### Check de Éxito
```typescript
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', duration: 0.5 }}
```

---

## Colores

### Header
- Fondo: `bg-primary-600` (#21808D)
- Texto: `text-white`

### Botones
- **Continuar al Pago:** Gradient primary-600 → primary-700
- **Ya Pagué:** `bg-green-600` → `hover:bg-green-700`

### Alertas
- **Instrucciones:** `bg-amber-50` + `border-amber-200`
- **Éxito:** `bg-green-50` + `border-green-200`

---

## Ejemplo Completo: Integración en Navbar

```tsx
'use client'
import { useState } from 'react'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CheckoutModal } from '@/components/cart/CheckoutModal'

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  return (
    <>
      <nav>
        {/* ... navbar content ... */}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  )
}
```

---

## Manejo de Errores

### Error al crear orden

```typescript
try {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({...})
    .select()
    .single()
  
  if (orderError) throw orderError
  
} catch (error: any) {
  console.error('Error creating order:', error)
  toast.error('Error al crear la orden: ' + error.message)
}
```

### Error al crear items

```typescript
const { error: itemsError } = await supabase
  .from('order_items')
  .insert(orderItems)

if (itemsError) throw itemsError
```

---

## Estados del Modal

```typescript
type Step = 'form' | 'qr' | 'success'

const [step, setStep] = useState<Step>('form')
const [orderId, setOrderId] = useState('')
const [isProcessing, setIsProcessing] = useState(false)
const [customerData, setCustomerData] = useState({
  name: '',
  phone: '',
  email: ''
})
```

---

## Responsive

- **Desktop:** Modal centrado, max-width 512px
- **Mobile:** Modal ocupa casi toda la pantalla
- **Scroll:** Contenido scrollable si excede 90vh

```css
className="max-w-lg max-h-[90vh] overflow-y-auto"
```

---

## Dependencias

```json
{
  "react-hot-toast": "^2.4.1",
  "framer-motion": "^12.33.0",
  "lucide-react": "^0.563.0",
  "@supabase/supabase-js": "^2.x"
}
```

---

## Próximas Mejoras

- [ ] Agregar campo de notas/comentarios
- [ ] Implementar cupones de descuento
- [ ] Agregar opción de pago en efectivo
- [ ] Enviar email de confirmación
- [ ] Agregar tracking de orden
- [ ] Implementar pago con tarjeta
- [ ] Agregar opción de envío a domicilio
- [ ] Mostrar resumen de productos en el modal

---

## Notas de Implementación

⚠️ **Supabase RLS:** Asegúrate de que las políticas RLS permitan INSERT público en `orders` y `order_items`.

⚠️ **Tabla products:** El script asume que existe una tabla `products` con los productos del catálogo.

⚠️ **WhatsApp:** El número 59176020369 está hardcodeado. Considera usar variable de entorno.

⚠️ **QR Image:** El QR debe estar en `/public/qr-yolo-pago.png`. Si no existe, Next.js mostrará error 404.

⚠️ **Toast Provider:** Asegúrate de tener `<Toaster />` en el layout para que las notificaciones funcionen.
