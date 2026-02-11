"use client";

import { useState, useEffect } from "react";
import { Menu, X, MessageCircle, Search, Heart, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { WishlistIcon } from "@/components/wishlist/WishlistIcon";

const WHATSAPP_URL =
  "https://wa.me/59176020369?text=Hola%20Lukess%20Home%2C%20me%20interesa%20conocer%20sus%20productos";

const categories = [
  {
    name: 'NUEVO',
    href: '/#catalogo?filter=nuevo',
    filter: 'nuevo',
  },
  {
    name: 'CAMISAS',
    href: '/#catalogo?filter=camisas',
    filter: 'camisas',
    subcategories: [
      { name: 'Columbia', filter: 'camisas-columbia' },
      { name: 'Manga larga', filter: 'camisas-manga-larga' },
      { name: 'Manga corta', filter: 'camisas-manga-corta' },
      { name: 'Elegantes', filter: 'camisas-elegantes' },
    ]
  },
  {
    name: 'PANTALONES',
    href: '/#catalogo?filter=pantalones',
    filter: 'pantalones',
    subcategories: [
      { name: 'Oversize', filter: 'pantalones-oversize' },
      { name: 'Jeans', filter: 'pantalones-jeans' },
      { name: 'Elegantes', filter: 'pantalones-elegantes' },
    ]
  },
  {
    name: 'BLAZERS',
    href: '/#catalogo?filter=blazers',
    filter: 'blazers',
  },
  {
    name: 'ACCESORIOS',
    href: '/#catalogo?filter=accesorios',
    filter: 'accesorios',
    subcategories: [
      { name: 'Sombreros', filter: 'accesorios-sombreros' },
      { name: 'Gorras', filter: 'accesorios-gorras' },
      { name: 'Cinturones', filter: 'accesorios-cinturones' },
      { name: 'Billeteras', filter: 'accesorios-billeteras' },
    ]
  },
];

const quickLinks = [
  { href: "/#ubicacion", label: "Ubicación" },
  { href: "/#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Extraer el hash base y los parámetros
    const [hashBase, queryString] = href.split('?');
    const id = hashBase.replace('/#', '');
    
    if (pathname !== '/') {
      // Si no estamos en la home, navegar primero
      router.push(href);
    } else {
      // Si ya estamos en la home, hacer scroll y aplicar filtro
      const element = document.getElementById(id);
      if (element) {
        const navbarHeight = 80;
        const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: 'smooth' });
        
        // Actualizar el hash con el filtro para que el catálogo lo detecte
        if (queryString) {
          window.history.pushState(null, '', href);
          // Disparar evento hashchange manualmente
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = `/?busqueda=${encodeURIComponent(searchQuery)}#catalogo`;
      
      if (pathname !== '/') {
        // Si no estamos en la home, navegar
        router.push(searchUrl);
      } else {
        // Si ya estamos en la home, actualizar URL y hacer scroll
        window.history.pushState(null, '', searchUrl);
        const element = document.getElementById('catalogo');
        if (element) {
          const navbarHeight = 80;
          const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // Disparar evento para que el catálogo detecte el cambio
        window.dispatchEvent(new Event('searchUpdate'));
      }
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isOpen
            ? "bg-white shadow-lg"
            : "bg-white/95 backdrop-blur-md"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-[72px] md:h-20 gap-4">
            {/* Logo - ARREGLADO */}
            <Link
              href="/"
              className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
            >
              <span className="text-xl sm:text-2xl md:text-[28px] font-extrabold tracking-tight text-primary-800">
                LUKESS
              </span>
              <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-accent-500">
                HOME
              </span>
              <span className="hidden sm:inline-block text-[9px] ml-1.5 px-1.5 py-0.5 rounded border text-gray-600 border-gray-300">
                Desde 2014
              </span>
            </Link>

            {/* Desktop Mega Menu */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {categories.map((category) => (
                <div key={category.name} className="relative group">
                  <Link
                    href={category.href}
                    onClick={(e) => handleNavClick(e, category.href)}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-primary-800 transition-colors px-3 py-2"
                  >
                    {category.name}
                  </Link>
                  
                  {category.subcategories && (
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100">
                      <div className="py-3 px-4">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={`/#catalogo?filter=${sub.filter}`}
                            onClick={(e) => handleNavClick(e, `/#catalogo?filter=${sub.filter}`)}
                            className="block py-2 text-sm text-gray-700 hover:text-primary-800 hover:translate-x-1 transition-all"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Quick Links */}
              <div className="h-5 w-px bg-gray-200 mx-2"></div>
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium text-gray-700 hover:text-primary-800 transition-colors px-3 py-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Acciones derecha */}
            <div className="flex items-center gap-3">
              {/* Buscador Desktop - ARREGLADO */}
              <form onSubmit={handleSearch} className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-48 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary-600 focus:outline-none transition-colors"
                  />
                </div>
              </form>

              {/* Wishlist Icon */}
              <div className="hidden lg:block">
                <WishlistIcon />
              </div>

              {/* Cart Button */}
              <div className="hidden lg:block">
                <CartButton onClick={() => setIsCartOpen(true)} />
              </div>

              {/* WhatsApp */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-whatsapp/20 flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">WhatsApp</span>
              </a>

              {/* Hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-xl transition-all duration-200 text-gray-800 hover:bg-gray-100"
                aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isOpen ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </Container>

        {/* Drawer mobile */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-5 space-y-1">
                {/* Mobile search - PRIMERO */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mb-4"
                >
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none"
                      />
                    </div>
                  </form>
                </motion.div>

                {categories.map((category, i) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.25,
                      ease: "easeOut" as const,
                    }}
                  >
                    <Link
                      href={category.href}
                      onClick={(e) => handleNavClick(e, category.href)}
                      className="flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold text-gray-800 hover:text-primary-800 hover:bg-gray-50 transition-all duration-200"
                    >
                      <span>{category.name}</span>
                    </Link>
                    
                    {category.subcategories && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={`/#catalogo?filter=${sub.filter}`}
                            onClick={(e) => handleNavClick(e, `/#catalogo?filter=${sub.filter}`)}
                            className="block py-2 px-4 text-sm text-gray-600 hover:text-primary-800 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="h-px bg-gray-200 my-4"></div>

                {/* Quick Links */}
                {quickLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (categories.length + i) * 0.05,
                      duration: 0.25,
                      ease: "easeOut" as const,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-base font-medium text-gray-700 hover:text-primary-800 hover:bg-gray-50 transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Wishlist + Cart buttons mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (categories.length + quickLinks.length) * 0.05 + 0.05,
                    duration: 0.25,
                  }}
                  className="pt-3 flex gap-2"
                >
                  <Link
                    href="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
                  >
                    <Heart className="w-4 h-4" />
                    Favoritos
                  </Link>
                  <button
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-900 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Carrito
                  </button>
                </motion.div>

                {/* WhatsApp CTA mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (categories.length + quickLinks.length) * 0.05 + 0.1,
                    duration: 0.25,
                  }}
                >
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white w-full py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-whatsapp/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Escríbenos por WhatsApp
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Overlay cuando el drawer está abierto */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
