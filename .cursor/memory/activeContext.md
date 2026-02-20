# Lukess Home Landing — Active Context

## Current Block
**3e** — Inventory sync: auto-decrement + sales history canal

## Completed Blocks
- **3d** ✅ Checkout GPS-based shipping cost + delivery/pickup options (20 feb 2026)
  - lib/utils/shipping.ts: Haversine formula, getDistanceFromMutualista, calculateShippingCost, getMapsLink, PICKUP_LOCATIONS
  - Tabla de costos por distancia GPS: 0-3km→Bs15, 3-6km→Bs20, 6-10km→Bs25, 10-15km→Bs35, +15km→Bs45
  - GPS REQUERIDO para envío a domicilio — sin GPS no se puede continuar
  - CheckoutModal: GPS loading spinner, distancia + costo calculado en tiempo real, warning GPS denegado
  - Botón submit bloqueado hasta capturar GPS (delivery) / seleccionar puesto (pickup)
  - Step 2 QR: muestra total + distancia en km
  - Step 3 confirmación: "Ver mi ubicación en Maps →" con link real GPS
  - WhatsApp message incluye link GPS real
  - app/api/checkout/route.ts: guarda gps_lat, gps_lng, gps_distance_km, maps_link
  - components/producto/ProductDetail.tsx: banner "Envío a Santa Cruz · desde Bs 15 · Retiro gratis"
  - components/cart/CartDrawer.tsx: progress bar hacia envío gratis (≥ Bs 400)
  - lib/types.ts: Order interface con gps_lat, gps_lng, gps_distance_km, maps_link
  - ⚠️ PENDIENTE: Ejecutar supabase/migrations/03d_shipping_fields.sql en Supabase SQL Editor

- **3a** ✅ Customer Auth: Schema + Checkout upgrade + Order tracking (20 feb 2026)
  - Nuevas tablas: `customers`, `subscribers`
  - Nuevos campos en `orders`: marketing_consent, managed_by, internal_notes, discount_percent, customer_id
  - Auth system: AuthContext, AuthModal (Google + email/password)
  - CheckoutModal: email obligatorio, marketing consent, post-purchase CTA
  - /mis-pedidos: modo guest (búsqueda por email) + modo autenticado
  - Navbar: botón Entrar / dropdown usuario logueado
  - ⚠️ PENDIENTE: Ejecutar migraciones SQL en Supabase Dashboard
    (ver SQL en BLOCK_3a_MIGRATIONS.sql o en el historial del chat)

- **3c** ✅ Checkout security + QR improvements + Libélula placeholder (20 feb 2026)
  - app/api/checkout/route.ts: validaciones server-side + anti-spam
  - Honeypot field en formulario (campo 'website' oculto)
  - Rate limiting en memoria: 3 por email / 5 por IP por hora
  - Validaciones: nombre ≥3 chars, teléfono 7-8 dígitos, email, total > 0, items no vacío
  - Orden creada con SERVICE_ROLE_KEY (no anon key) desde el servidor
  - CheckoutModal: WhatsApp botón opcional (no automático)
  - CheckoutModal: Card "Crear cuenta" con botón × explícito (no se auto-cierra)
  - CheckoutModal: Botón "Seguir comprando" limpia carrito y cierra modal
  - CheckoutModal: Selector de método de pago — QR activo, Libélula disabled+placeholder
  - ⚠️ PENDIENTE: Agregar SUPABASE_SERVICE_ROLE_KEY a Vercel Environment Variables

- **3b** ✅ Wishlist sync: localStorage → Supabase (20 feb 2026)
  - Nueva tabla: `wishlists` (user_id, product_id, RLS habilitado)
  - lib/services/wishlistService.ts: get, add, remove, merge, clear
  - WishlistContext: sync con Supabase para usuarios logueados, localStorage para guests
  - Merge automático de localStorage → Supabase al iniciar sesión
  - AuthModal: Google OAuth activo (eliminado guard "Próximamente"), spinner "Redirigiendo a Google..."
  - WishlistClient: banner "guardados en tu cuenta" (logueado) / "sesión actual + botón login" (guest)
  - layout.tsx: AuthProvider ahora envuelve WishlistProvider (orden correcto)
  - ⚠️ PENDIENTE: Ejecutar migración SQL en Supabase Dashboard
    (ver supabase/migrations/03b_wishlist_sync.sql)

## Project URLs
- Landing: https://lukess-home.vercel.app
- Supabase (compartido): https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh

## Pending Blocks (Landing)
3e → Inventory sync: auto-decrement + sales history canal
9  → GA4 + SEO dinámico + pulido final

## Important Notes
- Mismo Supabase que el sistema de inventario
- published_to_landing = true requerido para que productos aparezcan
- Wishlist: Supabase para logueados, localStorage para guests
- Carrito: localStorage (no necesita auth)
- Google OAuth: configurado en Supabase Dashboard → Auth → Providers → Google
- Auth callback: /auth/callback (ya creado)
- NEXT_PUBLIC_SITE_URL no está en .env.local — agregar para OAuth correcto
