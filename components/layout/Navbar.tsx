"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/ui/Container";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutModal } from "@/components/cart/CheckoutModal";

/* ───────── Constantes ───────── */

const WHATSAPP_URL =
  "https://wa.me/59176020369?text=Hola%20Lukess%20Home%2C%20me%20interesa%20conocer%20sus%20productos";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#catalogo", label: "Catálogo" },
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
    const sectionIds = navLinks.map((l) => l.href.replace("#", ""));
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
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-[72px] md:h-20">
            {/* ── Logo ── */}
            <a
              href="#inicio"
              onClick={(e) => scrollToSection(e, "#inicio")}
              className="flex items-center gap-1.5 shrink-0"
            >
              <span
                className={`text-xl sm:text-2xl md:text-[28px] font-extrabold tracking-tight transition-colors duration-300 ${
                  scrolled || isOpen ? "text-primary-600" : "text-white"
                }`}
              >
                LUKESS
              </span>
              <span
                className={`text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase transition-colors duration-300 ${
                  scrolled || isOpen ? "text-accent-500" : "text-accent-400"
                }`}
              >
                HOME
              </span>
              <span
                className={`hidden sm:inline-block text-[9px] ml-1.5 px-1.5 py-0.5 rounded border transition-colors duration-300 ${
                  scrolled || isOpen
                    ? "text-secondary-400 border-secondary-200"
                    : "text-white/50 border-white/20"
                }`}
              >
                Desde 2014
              </span>
            </a>

            {/* ── Desktop links ── */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className={`
                      relative px-4 py-2 rounded-full text-sm font-medium tracking-wide
                      transition-all duration-300
                      ${
                        isActive
                          ? scrolled
                            ? "text-primary-600"
                            : "text-white"
                          : scrolled
                            ? "text-secondary-500 hover:text-primary-600"
                            : "text-white/70 hover:text-white"
                      }
                    `}
                  >
                    {link.label}
                    {/* Indicador activo */}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active"
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${
                          scrolled ? "bg-primary-500" : "bg-accent-400"
                        }`}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            {/* ── Acciones derecha ── */}
            <div className="flex items-center gap-3">
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
                className={`lg:hidden p-2 rounded-xl transition-all duration-200 ${
                  scrolled || isOpen
                    ? "text-secondary-700 hover:bg-secondary-100"
                    : "text-white hover:bg-white/10"
                }`}
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
              className="lg:hidden bg-white border-t border-secondary-100 overflow-hidden"
            >
              <div className="px-6 py-5 space-y-1">
                {navLinks.map((link, i) => {
                  const isActive = activeSection === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: i * 0.05,
                        duration: 0.25,
                        ease: "easeOut" as const,
                      }}
                    >
                      <a
                        href={link.href}
                        onClick={(e) => scrollToSection(e, link.href)}
                        className={`
                          flex items-center gap-3 py-3 px-4 rounded-xl text-base font-medium
                          transition-all duration-200
                          ${
                            isActive
                              ? "text-primary-600 bg-primary-50"
                              : "text-secondary-600 hover:text-primary-600 hover:bg-secondary-50"
                          }
                        `}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-primary-500" : "bg-secondary-300"
                          }`}
                        />
                        {link.label}
                      </a>
                    </motion.div>
                  );
                })}

                {/* Cart Button mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: navLinks.length * 0.05 + 0.05,
                    duration: 0.25,
                  }}
                  className="pt-3"
                >
                  <button
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white w-full py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
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
                    delay: navLinks.length * 0.05 + 0.1,
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
