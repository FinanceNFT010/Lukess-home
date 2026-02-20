# Lukess Home Landing — Active Context

## Current Block
**3c** — Checkout security + QR improvements + Libélula placeholder

## Completed Blocks
- **3a** ✅ Customer Auth: Schema + Checkout upgrade + Order tracking (20 feb 2026)
  - Nuevas tablas: `customers`, `subscribers`
  - Nuevos campos en `orders`: marketing_consent, managed_by, internal_notes, discount_percent, customer_id
  - Auth system: AuthContext, AuthModal (Google + email/password)
  - CheckoutModal: email obligatorio, marketing consent, post-purchase CTA
  - /mis-pedidos: modo guest (búsqueda por email) + modo autenticado
  - Navbar: botón Entrar / dropdown usuario logueado
  - ⚠️ PENDIENTE: Ejecutar migraciones SQL en Supabase Dashboard
    (ver SQL en BLOCK_3a_MIGRATIONS.sql o en el historial del chat)

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
3c → Checkout security + QR improvements + Libélula placeholder
9  → GA4 + SEO dinámico + pulido final

## Important Notes
- Mismo Supabase que el sistema de inventario
- published_to_landing = true requerido para que productos aparezcan
- Wishlist: Supabase para logueados, localStorage para guests
- Carrito: localStorage (no necesita auth)
- Google OAuth: configurado en Supabase Dashboard → Auth → Providers → Google
- Auth callback: /auth/callback (ya creado)
- NEXT_PUBLIC_SITE_URL no está en .env.local — agregar para OAuth correcto
