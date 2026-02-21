# Lukess Home Landing — Active Context
**Última actualización:** 21/02/2026 03:00 AM — Bloque 3e completo ✅


## Bloque actual
**Bloque 4a** — Checkout auth: login obligatorio al pagar


## Bloques completados ✅
- **3a** ✅ Customer Auth: Schema + Checkout upgrade + Order tracking
          (20 feb 2026)
  · Tablas: customers, subscribers
  · Campos en orders: marketing_consent, managed_by, internal_notes,
    discount_percent, customer_id
  · AuthContext, AuthModal (Google + email/password)
  · CheckoutModal: email obligatorio, marketing consent, post-purchase CTA
  · /mis-pedidos: modo guest (búsqueda email) + modo autenticado
  · Navbar: botón Entrar / dropdown usuario logueado

- **3b** ✅ Wishlist sync: localStorage → Supabase (20 feb 2026)
  · Tabla: wishlists (user_id, product_id, RLS habilitado)
  · lib/services/wishlistService.ts: get, add, remove, merge, clear
  · WishlistContext: sync Supabase logueados / localStorage guests
  · Merge automático localStorage → Supabase al iniciar sesión
  · Google OAuth activo en AuthModal

- **3c** ✅ Checkout security + QR + Libélula placeholder (20 feb 2026)
  · app/api/checkout/route.ts: validaciones server-side completas
  · Honeypot field (campo 'website' oculto anti-bots)
  · Rate limiting: 3 por email / 5 por IP por hora
  · Validaciones: nombre ≥3 chars, teléfono 7-8 dígitos, total > 0
  · Orden creada con SUPABASE_SERVICE_ROLE_KEY (server-side)
  · Selector método de pago: QR activo, Libélula disabled+placeholder

- **3d** ✅ Checkout GPS shipping cost + delivery/pickup (20 feb 2026)
  · lib/utils/shipping.ts: fórmula Haversine, calculateShippingCost
  · GPS REQUERIDO para envío a domicilio
  · CheckoutModal: GPS spinner, distancia + costo en tiempo real
  · Step 3 confirmación: link real GPS a Google Maps
  · Tabla costos → ver sección "Costos de envío" abajo

- **3e-A** ✅ Sistema reservas inventario completo (21 feb 2026)
  · RPC reserve_order_inventory llamado desde api/checkout/route.ts
    inmediatamente después de crear order + order_items
  · revalidatePath('/', 'page') + revalidatePath('/producto/[id]', 'page')
    invalidan caché Next.js post-reserva → landing refleja stock real
  · Stock disponible = quantity - reserved_qty en tiempo real
  · Dar "ya pagué" → reserved_qty sube → landing muestra menos stock
  · Cancelar pedido → reserved_qty se libera → stock vuelve
  · Completar pedido → quantity baja definitivamente + historial ventas
  · Prioridad: Puesto 1 → Puesto 2 → Puesto 3 → Bodega Central

- **3e-B** ✅ Per-size stock en landing (21 feb 2026)
  · getStockBySize(): agrupa inventory por talla, suma disponible
    de todas las ubicaciones para esa talla
  · Tallas agotadas → disabled + line-through + badge "Agotado"
  · Tallas con 1-3 unidades → "⚠️ Últimas X unidades"
  · Cantidad máxima = stock de la talla seleccionada (no total)
  · Cambiar talla → resetea cantidad a 1 automáticamente
  · Botón "Agregar al carrito":
    - Sin talla seleccionada → "Selecciona una talla"
    - Talla agotada         → "Talla agotada" (disabled)
    - Normal                → "Agregar al carrito"


## Project URLs
- Landing: https://lukess-home.vercel.app
- Supabase (compartido): https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh
- Dashboard: c:\LukessHome\lukess-inventory-system
- Landing local: c:\LukessHome\pagina web\prueba


## Costos de envío
| Distancia   | Costo  | Referencia              |
|-------------|--------|-------------------------|
| 0 - 1 km    | Bs 5   | Dentro del mercado      |
| 1 - 3 km    | Bs 10  | Zona centro cercana     |
| 3 - 6 km    | Bs 15  | Zona media              |
| 6 - 10 km   | Bs 20  | Zona alejada            |
| 10 - 20 km  | Bs 30  | Límite del servicio     |
| +20 km      | ❌     | WhatsApp para cotizar   |
| ≥ Bs 400    | Gratis | Hasta 20km              |


## ⚠️ Lecciones críticas aprendidas (20/02/2026)
- SIEMPRE verificar proyecto correcto en Cursor antes de cualquier prompt
  Landing = c:\LukessHome\pagina web\prueba
  Si Cursor dice que ProductDetail.tsx no existe → proyecto equivocado
- Bugs de stock → verificar en SQL Editor PRIMERO antes de tocar código
- Después de git push → esperar deploy Vercel y probar manualmente
- revalidatePath es OBLIGATORIO en cualquier route que modifique stock
- Nuevo chat en Cursor por cada bloque SIN EXCEPCIONES


## Bloques pendientes
4a  → Checkout: login obligatorio al pagar
4b  → Mis Pedidos: /mis-pedidos funcional con historial real
5   → Toggle published_to_landing
6a  → Emails Resend: confirmación al cliente post-compra
6b  → Emails Resend: notificación admin + cambios de estado
7   → WhatsApp Business API
8   → Reportes ventas online vs físico
9   → GA4 + SEO dinámico + pulido final


## Notas técnicas
- Mismo Supabase que sistema de inventario (compartido)
- published_to_landing = true requerido para aparecer en tienda
- Wishlist: Supabase para logueados / localStorage para guests
- Carrito: localStorage (no requiere auth)
- Google OAuth: configurado en Supabase → Auth → Providers → Google
- Auth callback: /auth/callback (ya creado)
- NEXT_PUBLIC_SITE_URL → pendiente agregar en Vercel (OAuth correcto)
- MCP Supabase: ON solo en bloques con SQL
- MCP Vercel: ON solo si hay error de deploy
- Modelo: Claude Sonnet 4.6, Max Mode OFF por defecto
- Nuevo chat en Cursor por cada bloque
