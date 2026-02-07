# Lukess Home - Landing Page

Landing page profesional para **Lukess Home**, tienda de ropa masculina ubicada en el Mercado Mutualista, Santa Cruz de la Sierra, Bolivia.

## Sobre el negocio

- **Nombre:** Lukess Home
- **Giro:** Venta de ropa masculina (camisas, pantalones, chaquetas, gorras, accesorios)
- **Ubicación:** Mercado Mutualista — 3 puestos
- **Experiencia:** +10 años en el mercado
- **Contacto:** (+591) 76020369

## Tecnologías

- [Next.js 16](https://nextjs.org/) — App Router + Turbopack
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) — Animaciones
- [Lucide React](https://lucide.dev/) — Iconos
- [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer) — Scroll animations

## Estructura del proyecto

```
app/
  layout.tsx       # Layout principal con SEO
  page.tsx         # Página principal
  loading.tsx      # Skeleton screens
  globals.css      # Estilos globales + tema

components/
  layout/          # Navbar, Footer, WhatsApp flotante
  home/            # Secciones de la landing page
  ui/              # Componentes reutilizables

lib/
  productos.ts     # Datos del catálogo

public/
  favicon.svg      # Favicon
  og-image.svg     # Imagen Open Graph
```

## Secciones

1. **Hero** — Presentación con CTAs
2. **Puestos** — 3 ubicaciones en el mercado
3. **Catálogo** — Productos con filtro por categoría
4. **Testimonios** — Carousel de clientes
5. **Ubicación** — Google Maps + información de contacto
6. **CTA Final** — Llamada a la acción

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

## Comandos disponibles

| Comando         | Descripción                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción                |
| `npm run start` | Servidor de producción             |
| `npm run lint`  | Verificar código con ESLint        |

## Deploy

El proyecto está optimizado para deploy en [Vercel](https://vercel.com).

## Créditos

- **Cliente:** Lukess Home
- **Ubicación:** Santa Cruz de la Sierra, Bolivia
- **TikTok:** [@lukess.home](https://www.tiktok.com/@lukess.home)
