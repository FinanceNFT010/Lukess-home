# Lukess Home Landing — Active Context

## Current Block
**3b** — Wishlist sync: localStorage → Supabase para usuarios logueados

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

## Project URLs
- Landing: https://lukess-home.vercel.app
- Supabase (compartido): https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh

## Pending Blocks (Landing)
3b → Wishlist sync: localStorage → Supabase para usuarios logueados
9  → GA4 + SEO dinámico + pulido final

## Important Notes
- Mismo Supabase que el sistema de inventario
- published_to_landing = true requerido para que productos aparezcan
- Wishlist actualmente en localStorage — migrar a Supabase en bloque 3b
- Carrito: localStorage (no necesita auth)
- Google OAuth: requiere configuración en Supabase Dashboard → Auth → Providers → Google
- Auth callback: /auth/callback (ya creado)
- NEXT_PUBLIC_SITE_URL no está en .env.local — agregar para OAuth correcto
