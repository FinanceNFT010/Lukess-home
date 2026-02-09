# Lukess Home - E-commerce

E-commerce completo para **Lukess Home**, tienda de ropa masculina ubicada en el Mercado Mutualista, Santa Cruz de la Sierra, Bolivia.

> 🎉 **Actualización:** Transformado de landing page estática a e-commerce funcional con sistema de inventario, carrito de compras, y checkout con QR de pago.

## Sobre el negocio

- **Nombre:** Lukess Home
- **Giro:** Venta de ropa masculina (camisas, pantalones, chaquetas, gorras, accesorios)
- **Ubicación:** Mercado Mutualista — 3 puestos
- **Experiencia:** +10 años en el mercado
- **Contacto:** (+591) 76020369

## Tecnologías

### Frontend
- [Next.js 16](https://nextjs.org/) — App Router + Turbopack
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) — Animaciones
- [Lucide React](https://lucide.dev/) — Iconos
- [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer) — Scroll animations
- [react-hot-toast](https://react-hot-toast.com/) — Notificaciones

### Backend
- [Supabase](https://supabase.com/) — Base de datos PostgreSQL
- [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) — Cliente JavaScript
- [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side) — Server-side rendering

## Estructura del proyecto

```
app/
  layout.tsx              # Layout con CartProvider + Toaster
  page.tsx                # Home (Server Component con fetch de Supabase)
  loading.tsx             # Skeleton screens
  globals.css             # Estilos globales + tema
  producto/[id]/page.tsx  # Página individual de producto

components/
  layout/                 # Navbar, Footer, WhatsApp flotante
  home/                   # Secciones de la landing page
    CatalogoClient.tsx    # Catálogo conectado a Supabase
  cart/                   # Sistema de carrito
    CartButton.tsx        # Botón con badge
    CartDrawer.tsx        # Drawer lateral
    CheckoutModal.tsx     # Modal de checkout (3 pasos)
  search/                 # Buscador global
    SearchBar.tsx         # Búsqueda en tiempo real
  producto/               # Detalle de producto
    ProductDetail.tsx     # Página completa de producto
  ui/                     # Componentes reutilizables

lib/
  supabase/               # Clientes de Supabase
    client.ts             # Cliente browser
    server.ts             # Cliente server
  context/                # Context API
    CartContext.tsx       # Gestión del carrito
  types.ts                # Tipos TypeScript

supabase/
  schema-orders.sql       # Script SQL para tablas
  README.md               # Guía de configuración

public/
  favicon.svg             # Favicon
  og-image.svg            # Imagen Open Graph
  qr-yolo-pago.png        # QR de pago
  products/               # Imágenes de productos
```

## Funcionalidades

### Landing Page
1. **Hero** — Presentación con CTAs
2. **Puestos** — 3 ubicaciones en el mercado
3. **Catálogo** — Productos desde Supabase con stock en tiempo real
4. **Testimonios** — Carousel de clientes
5. **Ubicación** — Google Maps + información de contacto
6. **CTA Final** — Llamada a la acción

### E-commerce
1. **Carrito de Compras** — Persistencia en localStorage
2. **Búsqueda en Tiempo Real** — Busca en nombre, SKU y marca
3. **Página de Producto** — Detalle completo con selectores de variantes
4. **Checkout con QR** — Proceso de pago en 3 pasos
5. **Stock en Tiempo Real** — De 3 ubicaciones físicas
6. **Integración WhatsApp** — Consultas y confirmaciones automáticas

## Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lrcggpdgrqltqbxqnjgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
NEXT_PUBLIC_WHATSAPP_NUMBER=59176020369
```

### 3. Configurar Supabase

1. Ve al SQL Editor de Supabase
2. Ejecuta el script `supabase/schema-orders.sql`
3. Verifica que las tablas `orders` y `order_items` se hayan creado
4. Verifica las políticas RLS

Ver guía completa en `supabase/README.md`

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Comandos disponibles

| Comando         | Descripción                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción                |
| `npm run start` | Servidor de producción             |
| `npm run lint`  | Verificar código con ESLint        |

## Deploy en Vercel

### 1. Configurar variables de entorno en Vercel

En el dashboard de Vercel, agrega las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://lrcggpdgrqltqbxqnjgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
NEXT_PUBLIC_WHATSAPP_NUMBER=59176020369
```

### 2. Deploy

```bash
git push origin main
```

O usa el CLI de Vercel:

```bash
vercel deploy --prod
```

### 3. Verificar

- ✅ Build exitoso
- ✅ Variables de entorno configuradas
- ✅ Tablas de Supabase creadas
- ✅ Página carga sin errores

---

## Troubleshooting

### Error: "supabaseUrl is required"
**Solución:** Verifica que las variables de entorno estén configuradas en Vercel.

### Error: "Unable to acquire lock"
**Solución:**
```bash
# Windows
taskkill /F /IM node.exe
Remove-Item .next\dev\lock -Force
npm run dev
```

### Error: "Application error: a client-side exception"
**Solución:** Verifica que las variables de entorno en Vercel tengan el prefijo `NEXT_PUBLIC_`.

## Créditos

- **Cliente:** Lukess Home
- **Ubicación:** Santa Cruz de la Sierra, Bolivia
- **TikTok:** [@lukess.home](https://www.tiktok.com/@lukess.home)
