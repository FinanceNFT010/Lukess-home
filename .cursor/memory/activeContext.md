# Lukess Home Landing — Active Context

## Current Block
**3e** — Inventory sync: auto-decrement + sales history canal

## Completed Blocks
- **3d** ✅ Checkout delivery options + shipping address (20 feb 2026)
  - lib/constants/shipping.ts: SHIPPING_CONFIG (umbral Bs 400, tarifa Bs 25) + PICKUP_LOCATIONS (3 puestos)
  - CheckoutModal: Sección B con 2 cards "Envío a domicilio" / "Recoger en tienda"
  - Campos condicionales: dirección + referencia + botón GPS (delivery) / selector de puestos (pickup)
  - Lógica de costo: pickup → gratis, ≥ Bs 400 → gratis, < Bs 400 → Bs 25
  - Order summary actualizado: muestra subtotal + envío + total
  - Step 2 QR: muestra orderTotal con nota de costo de envío
  - Step 3 confirmación: muestra dirección de entrega o puesto de recogida
  - app/api/checkout/route.ts: acepta y guarda shipping_cost, delivery_method, shipping_address, shipping_reference, pickup_location, gps_coordinates
  - lib/types.ts: Order interface ampliada con campos de shipping
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
