# Lukess Home — Emails + Inventario (Resumen técnico)

## Flujo de estados del pedido

Origen: landing (clientes) + sistema de inventario (admin).

Estados en tabla `orders`:

- pending    → pedido creado, sin reserva ni pago confirmado
- reserved   → cliente marcó "Ya Pagué" (reserva de stock)
- confirmed  → admin confirmó que el pago llegó
- shipped    → admin marcó "En camino" (Yango)
- completed  → admin marcó "Entregado" (descuento real de stock)
- cancelled  → admin canceló pedido (reserva liberada)

### Dónde se cambian los estados

- `pending`:
  - se asigna en `app/api/checkout/route.ts`
- `reserved`:
  - se alcanza al llamar `reserve_order_inventory(order_id)` desde `/api/reserve-order`
- `confirmed`, `shipped`, `completed`, `cancelled`:
  - se cambian desde el sistema `lukess-inventory-system` con la Server Action `updateOrderStatus`

---

## Reserva de stock

### Punto crítico de diseño

No se debe reservar stock cuando el usuario solo llega al QR de pago.  
La reserva ocurre recién cuando el cliente hace click en **"Ya Pagué"**.

### Implementación

- `app/api/checkout/route.ts`
  - Crea la orden en `orders` con:
    - `status: 'pending'`
  - Inserta los `order_items`
  - **No llama** a `reserve_order_inventory()`

- `app/api/reserve-order/route.ts`
  - Nueva API route POST
  - Body: `{ orderId: string }`
  - Llama a `supabase.rpc('reserve_order_inventory', { p_order_id: orderId })`

- `components/cart/CheckoutModal.tsx`
  - `handlePaymentConfirmed` (botón "Ya Pagué"):
    1. Envía email de confirmación de pedido:
       - `fetch('/api/send-email', { type: 'order_confirmation', ... })`
    2. Luego reserva stock:
       - `fetch('/api/reserve-order', { orderId })`

---

## Emails transaccionales (Resend)

API route principal:

- `app/api/send-email/route.ts`

Tipos soportados en el `switch`:

- `order_confirmation` → cliente: pedido recibido, pago en revisión
- `order_paid`         → cliente: pago confirmado
- `order_shipped`      → cliente: pedido en camino
- `order_completed`    → cliente: pedido entregado
- `order_cancelled`    → cliente: pedido cancelado (pendiente mostrar motivo)

### Entrada esperada (`orderData`)

Todos los tipos comparten la misma forma base:

```ts
type OrderEmailData = {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  items: any[]  // ver nota abajo
  subtotal: number
  shippingCost: number
  shippingDistance: number | null
  deliveryAddress: string | null
  locationUrl: string | null
  discountAmount: number
  discountCode: string | null
  total: number
  notifyByEmail?: boolean
  notifyByWhatsapp?: boolean
  cancellationReason?: string | null
}
Importante: estructura de items
El template debe ser defensivo porque los items pueden venir de dos orígenes:

Desde la landing (order_confirmation):

item.name, item.price, item.quantity, item.size, item.color

Desde el inventario (order_paid, order_shipped, etc.):

item.products?.name (JOIN order_items + products)

item.unit_price, item.quantity, item.size, item.color

El helper que genera la tabla de items no puede asumir solo item.name.
Ejemplo de acceso defensivo:

ts
const productName =
  item.name ??
  item.products?.name ??
  item.product_name ??
  'Producto'

const unitPrice =
  item.unit_price ?? item.price ?? 0

const quantity =
  item.quantity ?? item.qty ?? 1

const size =
  item.size ?? item.variant ?? null

const color =
  item.color ?? null
Resend y sandbox
Actualmente se usa:

ts
from: 'Lukess Home <onboarding@resend.dev>'
Limitaciones:

En modo sandbox solo envía a la dirección de la cuenta Resend
(ej: financenft01@gmail.com).

Para producción real se necesita:

Comprar un dominio (lukesshome.com u otro).

Verificarlo en el dashboard de Resend.

Cambiar el from a algo como:

from: 'Lukess Home <noreply@lukesshome.com>'.

Este cambio está planificado para el Bloque 9d (Dominio + deploy final).