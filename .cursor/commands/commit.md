---
name: commit
description: Git commit con mensaje descriptivo del bloque completado
---

Execute in terminal:

1. `git add .`
2. `git status`
3. Generate commit message:
   - Format: `feat(landing): description` or `feat(ecommerce): description`
   - Examples:
     feat(auth): add buyer registration and login modal
     feat(wishlist): persist wishlist to Supabase for logged-in users
     feat(checkout): require auth before payment step
4. `git commit -m "[message]"`
5. `git push origin main`
6. Confirm push successful + Vercel deploy URL
