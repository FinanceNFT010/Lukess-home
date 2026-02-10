"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, MessageCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { SearchBar } from "@/components/search/SearchBar";

/* ───────── Constantes ───────── */

const WHATSAPP_URL =
  "https://wa.me/59176020369?text=Hola%20Lukess%20Home%2C%20me%20interesa%20conocer%20sus%20productos";

const categories = [
  {
    name: 'NUEVO',
    href: '#catalogo?filter=nuevo',
    featured: [
      { name: 'Recién llegados', href: '#catalogo?filter=nuevo' },
      { name: 'Ofertas de semana', href: '#catalogo?filter=descuento' },
    ]
  },
  {
    name: 'CAMISAS',
    href: '#catalogo?filter=camisas',
    subcategories: [
      { name: 'Columbia', href: '#catalogo?filter=camisas&subcategory=Columbia' },
      { name: 'Manga larga', href: '#catalogo?filter=camisas&subcategory=Manga larga' },
      { name: 'Manga corta', href: '#catalogo?filter=camisas&subcategory=Manga corta' },
      { name: 'Elegantes', href: '#catalogo?filter=camisas&subcategory=Elegantes' },
    ]
  },
  {
    name: 'PANTALONES',
    href: '#catalogo?filter=pantalones',
    subcategories: [
      { name: 'Oversize', href: '#catalogo?filter=pantalones&subcategory=Oversize' },
      { name: 'Jeans', href: '#catalogo?filter=pantalones&subcategory=Jeans' },
      { name: 'Elegantes', href: '#catalogo?filter=pantalones&subcategory=Elegantes' },
    ]
  },
  {
    name: 'BLAZERS',
    href: '#catalogo?filter=blazers',
  },
  {
    name: 'ACCESORIOS',
    href: '#catalogo?filter=accesorios',
    subcategories: [
      { name: 'Sombreros', href: '#catalogo?filter=accesorios&subcategory=Sombreros' },
      { name: 'Gorras', href: '#catalogo?filter=accesorios&subcategory=Gorras' },
      { name: 'Cinturones', href: '#catalogo?filter=accesorios&subcategory=Cinturones' },
      { name: 'Billeteras', href: '#catalogo?filter=accesorios&subcategory=Billeteras' },
    ]
  },
];

const quickLinks = [
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#contacto", label: "Contacto" },
];

/* ───────── Componente ───────── */

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#inicio");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  /* ── Detectar scroll para background ── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Detectar sección activa vía IntersectionObserver ── */
  useEffect(() => {
    const allLinks = [...categories.map(c => c.href), ...quickLinks.map(l => l.href)];
    const sectionIds = [...new Set(allLinks)].map((l) => l.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${id}`);
          }
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* ── Smooth scroll programático ── */
  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setIsOpen(false);

      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (!el) return;

      const navbarHeight = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top, behavior: "smooth" });
    },
    []
  );

  /* ── Bloquear scroll del body cuando drawer abierto ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
            {/* ── Logo ── */}
            <a
              href="#inicio"
              onClick={(e) => scrollToSection(e, "#inicio")}
              className="flex items-center gap-1.5 shrink-0"
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
            </a>

            {/* ── Desktop Mega Menu ── */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {categories.map((category) => (
                <div key={category.name} className="relative group">
                  <a
                    href={category.href}
                    onClick={(e) => scrollToSection(e, category.href)}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-primary-800 transition-colors px-3 py-2"
                  >
                    {category.name}
                    {(category.subcategories || category.featured) && (
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                  </a>
                  
                  {/* Mega menu dropdown */}
                  {category.subcategories && (
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100">
                      <div className="py-3 px-4">
                        {category.subcategories.map((sub) => (
                          <a
                            key={sub.name}
                            href={sub.href}
                            onClick={(e) => scrollToSection(e, sub.href)}
                            className="block py-2 text-sm text-gray-700 hover:text-primary-800 hover:translate-x-1 transition-all"
                          >
                            {sub.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Featured dropdown para NUEVO */}
                  {category.featured && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100">
                      <div className="py-3 px-4">
                        {category.featured.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => scrollToSection(e, item.href)}
                            className="block py-2 text-sm font-medium text-gray-700 hover:text-primary-800 hover:translate-x-1 transition-all"
                          >
                            <span className="inline-block w-2 h-2 rounded-full bg-accent-400 mr-2"></span>
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Quick Links */}
              <div className="h-5 w-px bg-gray-200 mx-2"></div>
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-sm font-medium text-gray-700 hover:text-primary-800 transition-colors px-3 py-2"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* ── Acciones derecha ── */}
            <div className="flex items-center gap-3">
              {/* SearchBar (Desktop) */}
              <div className="hidden lg:block">
                <SearchBar />
              </div>

              {/* Cart Button - Desktop */}
              <div className="hidden lg:block">
                <CartButton onClick={() => setIsCartOpen(true)} />
              </div>

              {/* WhatsApp - Icono solo en mobile, completo en desktop */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white px-3 py-2.5 lg:px-5 lg:py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-whatsapp/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden lg:inline">WhatsApp</span>
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

        {/* ── Drawer mobile ── */}
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
                {/* Categories */}
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
                    <a
                      href={category.href}
                      onClick={(e) => scrollToSection(e, category.href)}
                      className="flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold text-gray-800 hover:text-primary-800 hover:bg-gray-50 transition-all duration-200"
                    >
                      <span>{category.name}</span>
                      {(category.subcategories || category.featured) && (
                        <ChevronDown className="w-4 h-4 opacity-60" />
                      )}
                    </a>
                    
                    {/* Subcategories mobile */}
                    {category.subcategories && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.subcategories.map((sub) => (
                          <a
                            key={sub.name}
                            href={sub.href}
                            onClick={(e) => scrollToSection(e, sub.href)}
                            className="block py-2 px-4 text-sm text-gray-600 hover:text-primary-800 transition-colors"
                          >
                            {sub.name}
                          </a>
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
                    <a
                      href={link.href}
                      onClick={(e) => scrollToSection(e, link.href)}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-base font-medium text-gray-700 hover:text-primary-800 hover:bg-gray-50 transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {link.label}
                    </a>
                  </motion.div>
                ))}

                {/* Cart Button mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (categories.length + quickLinks.length) * 0.05 + 0.05,
                    duration: 0.25,
                  }}
                  className="pt-3"
                >
                  <button
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-900 text-white w-full py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ver Carrito
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
