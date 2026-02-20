---
name: verify
description: Verifica implementación completa sin errores en la landing page
---

Run these steps and report results:

1. `npm run build` — must complete with 0 errors, 0 warnings
2. `npm run lint` — must show 0 errors
3. Confirm localhost:3000 is running
4. List ALL files modified or created this session
5. For each file confirm: no TypeScript errors, no unused imports
6. Test these critical paths manually:
   - Homepage loads with products from Supabase
   - Filters work (category, price, size)
   - Add to cart works + CartDrawer opens
   - Wishlist button toggles correctly
7. Report: ✅ VERIFIED or ❌ ISSUES with specific details
