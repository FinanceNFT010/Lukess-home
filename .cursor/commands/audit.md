---
name: audit
description: Auditoría completa del estado de la landing page
---

Complete audit:

1. **Components**: list all in components/ with their purpose
2. **Pages**: list all routes and confirm no 404s
3. **Supabase**: verify products load, orders table exists, RLS correct
4. **Cart**: test add/remove/update quantity persists in localStorage
5. **Checkout**: test all 3 steps complete without errors
6. **Wishlist**: test add/remove, badge updates, /wishlist page loads
7. **Responsive**: confirm mobile layout works (check at 375px width)
8. **Build**: `npm run build` result
9. **Summary**:
   ✅ Working | ⚠️ Needs attention | ❌ Critical issues
