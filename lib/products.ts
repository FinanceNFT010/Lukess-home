/* ───────── Tipos ───────── */

export type Category = "Camisas" | "Pantalones" | "Chaquetas" | "Gorras" | "Accesorios";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: Category;
  images: string[];
  sizes: string[];
  badge: "Nuevo" | "Popular" | null;
}

/* ───────── Categorías ───────── */

export const categories = [
  "Todos",
  "Camisas",
  "Pantalones",
  "Chaquetas",
  "Gorras",
  "Accesorios",
] as const;

export type FilterCategory = (typeof categories)[number];

/* ───────── Catálogo de productos ───────── */

export const products: Product[] = [
  {
    id: "prod_01",
    name: "Camisa Columbia Verde Militar Outdoor",
    slug: "camisa-columbia-verde",
    description:
      "Camisa técnica tipo safari con múltiples bolsillos funcionales y material de secado rápido. Perfecta para actividades outdoor o look casual urbano.",
    price: 319,
    category: "Camisas",
    images: ["/products/camisa-columbia-verde.png"],
    sizes: ["S", "M", "L", "XL"],
    badge: "Popular",
  },
  {
    id: "prod_02",
    name: "Polera Palm Angels Terracota Premium",
    slug: "polera-palmangels-terracota",
    description:
      "Camiseta de diseño exclusivo en tono terracota. Algodón premium con cuello y puños en contraste blanco y tipografía gótica icónica.",
    price: 319,
    category: "Camisas",
    images: ["/products/polera-palmangels-terracota.png"],
    sizes: ["S", "M", "L", "XL"],
    badge: "Popular",
  },
  {
    id: "prod_03",
    name: "Polo Navy Premium con Micro-Textura",
    slug: "polo-navy-texturizado",
    description:
      "Polo en azul marino profundo con tejido Jacquard de micro-diseño geométrico. Ribetes blancos en cuello y puños para un contraste elegante.",
    price: 219,
    category: "Camisas",
    images: ["/products/polo-azul-texturizado.png"],
    sizes: ["S", "M", "L", "XL"],
    badge: "Nuevo",
  },
  {
    id: "prod_04",
    name: "Pantalón Drill Slim Fit Beige",
    slug: "pantalon-drill-beige",
    description:
      "Pantalón drill (chino) en color beige neutro esencial. Corte Slim Fit en algodón resistente y cómodo. Versátil para oficina o salidas casuales.",
    price: 269,
    category: "Pantalones",
    images: ["/products/pantalon-drill-beige.png"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    badge: "Popular",
  },
  {
    id: "prod_05",
    name: "Camisa Blanca Casual Botones Contraste",
    slug: "camisa-blanca-casual",
    description:
      "Camisa manga corta en tejido ligero tipo lino. Diseño minimalista con botones oscuros en contraste. Frescura y estilo para el clima de Santa Cruz.",
    price: 199,
    category: "Camisas",
    images: ["/products/camisa-blanca-casual.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    badge: null,
  },
  {
    id: "prod_06",
    name: "Jean Urbano Azul Moto & Ripped",
    slug: "jean-azul-moto",
    description:
      "Jean azul medio con diseño urbano agresivo. Paneles estilo motociclista en rodillas y roturas estratégicas. Corte Slim Fit con parche de cuero.",
    price: 319,
    category: "Pantalones",
    images: ["/products/pantalon-jean-azul-moto.png"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    badge: "Nuevo",
  },
  {
    id: "prod_07",
    name: "Chaqueta Bomber Negra Técnica",
    slug: "chaqueta-bomber-negra",
    description:
      "Bomber en negro intenso satinado. Tejido técnico con cierres metálicos plateados de alta calidad y placa de logo en el pecho. Puños y cintura elásticos.",
    price: 369,
    category: "Chaquetas",
    images: ["/products/chaqueta-bomber-negra.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    badge: "Popular",
  },
  {
    id: "prod_08",
    name: "Saco Blazer Casual Gris Texturizado",
    slug: "saco-casual-gris",
    description:
      "Blazer casual en gris medio con textura jaspeada. Diseño desestructurado con bolsillos de parche y cierre de dos botones. Eleva cualquier look con jeans.",
    price: 369,
    category: "Chaquetas",
    images: ["/products/saco-casual-gris.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    badge: null,
  },
  {
    id: "prod_09",
    name: "Jean Slim Tapered Índigo Oscuro",
    slug: "jean-indigo-oscuro",
    description:
      "Jean clásico en tono índigo profundo (Dark Wash) limpio. Denim premium de alto gramaje con costuras tabaco en contraste. Corte Slim Tapered elegante.",
    price: 299,
    category: "Pantalones",
    images: ["/products/pantalon-jean-indigo-oscuro.png"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    badge: "Nuevo",
  },
  {
    id: "prod_10",
    name: "Gorra Minimalista Azul Marino",
    slug: "gorra-azul-minimalista",
    description:
      "Gorra clásica de 6 paneles en sarga de algodón lavado. Diseño minimalista sin logos frontales, ideal para combinar con todo. Ajuste con hebilla metálica.",
    price: 79,
    category: "Gorras",
    images: ["/products/gorra-azul-minimalista.png"],
    sizes: ["Talla Única"],
    badge: "Nuevo",
  },
  {
    id: "prod_11",
    name: "Cinturón Cuero Genuino Café",
    slug: "cinturon-cuero-cafe",
    description:
      "Cinturón de cuero genuino en tono café cognac. Hebilla metálica cuadrada con acabado cepillado y costuras reforzadas. El accesorio esencial duradero.",
    price: 129,
    category: "Accesorios",
    images: ["/products/cinturon-cuero-cafe.png"],
    sizes: ["S (28-32)", "M (32-36)", "L (36-40)", "XL (40-44)"],
    badge: null,
  },
];

/* ───────── Helpers ───────── */

export function getProductsByCategory(category: string): Product[] {
  if (category === "Todos") return products;
  return products.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
