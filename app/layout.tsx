import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { CartProvider } from "@/lib/context/CartContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#21808D",
};

export const metadata: Metadata = {
  title: "Lukess Home - Ropa Masculina en Santa Cruz | Mercado Mutualista",
  description:
    "Más de 10 años vistiendo a bolivianos con estilo. 3 puestos en el Mercado Mutualista. Camisas, pantalones, chaquetas y más. Calidad y precio justo.",
  keywords: [
    "ropa masculina santa cruz",
    "tienda hombre mercado mutualista",
    "camisas santa cruz",
    "pantalones hombre bolivia",
    "ropa masculina",
    "tienda de ropa",
    "Santa Cruz",
    "Bolivia",
    "Mercado Mutualista",
    "chaquetas",
    "gorras",
    "moda hombre",
    "Lukess Home",
  ],
  authors: [{ name: "Lukess Home" }],
  creator: "Lukess Home",
  publisher: "Lukess Home",
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  metadataBase: new URL("https://lukesshome.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lukess Home - Ropa Masculina en Santa Cruz | Mercado Mutualista",
    description:
      "Más de 10 años vistiendo a bolivianos con estilo. 3 puestos en el Mercado Mutualista. Camisas, pantalones, chaquetas y más.",
    url: "https://lukesshome.com",
    siteName: "Lukess Home",
    locale: "es_BO",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lukess Home - Ropa Masculina en Santa Cruz, Bolivia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lukess Home - Ropa Masculina en Santa Cruz",
    description:
      "3 puestos en el Mercado Mutualista. Camisas, pantalones, chaquetas y más. Calidad y precio justo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="font-sans">
        <CartProvider>
          <a
            href="#inicio"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
          >
            Saltar al contenido principal
          </a>
          <Navbar />
          <main role="main">{children}</main>
          <Footer />
          <WhatsAppFloat />
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
