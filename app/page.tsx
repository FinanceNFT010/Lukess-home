import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import PuestosSection from "@/components/home/PuestosSection";
import CatalogoSection from "@/components/home/CatalogoSection";
import TestimoniosSection from "@/components/home/TestimoniosSection";
import UbicacionSection from "@/components/home/UbicacionSection";
import CTAFinalSection from "@/components/home/CTAFinalSection";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Lukess Home - Ropa Masculina en Santa Cruz | Mercado Mutualista",
  description:
    "Más de 10 años vistiendo a bolivianos con estilo. 3 puestos en el Mercado Mutualista. Camisas, pantalones, chaquetas y más. Calidad y precio justo.",
  keywords:
    "ropa masculina santa cruz, tienda hombre mercado mutualista, camisas santa cruz, pantalones hombre bolivia, chaquetas santa cruz, gorras bolivia",
  openGraph: {
    title: "Lukess Home - Ropa Masculina de Calidad en Santa Cruz",
    description:
      "Más de 10 años vistiendo a bolivianos. Visítanos en el Mercado Mutualista.",
    type: "website",
    locale: "es_BO",
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Lukess Home",
    description: "Tienda de ropa masculina en Santa Cruz, Bolivia",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Mercado Mutualista, Av. Mutualista y Tercer Anillo Externo",
      addressLocality: "Santa Cruz de la Sierra",
      addressCountry: "BO",
    },
    telephone: "+59176020369",
    openingHours: ["Mo-Sa 08:00-22:00", "Su 09:00-21:00"],
    priceRange: "Bs 79 - Bs 369",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Catálogo de Productos",
      itemListElement: products.map((product) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images[0],
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "BOB",
            availability: "https://schema.org/InStock",
          },
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeroSection />
      <PuestosSection />
      <CatalogoSection />
      <TestimoniosSection />
      <UbicacionSection />
      <CTAFinalSection />
    </>
  );
}
