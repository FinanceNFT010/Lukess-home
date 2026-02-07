"use client";

import { MessageCircle, ChevronDown, MapPin } from "lucide-react";
import { motion } from "framer-motion";

/* ───────── Constantes ───────── */

const WHATSAPP_URL =
  "https://wa.me/59176020369?text=Hola%20Lukess%20Home,%20quiero%20consultar%20sobre%20sus%20productos";

/* ───────── Variantes de animación ───────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
} as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* ───────── Componente ───────── */

export default function HeroSection() {
  return (
    <section
      id="inicio"
      aria-label="Bienvenida a Lukess Home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Imagen de fondo + overlay ── */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder gradient (reemplazar por next/image con foto real) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop')",
          }}
        />

        {/* Overlay oscuro con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/80 via-secondary-900/70 to-secondary-900/90" />

        {/* Gradiente decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* ── Partículas / decoración sutil ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      {/* ── Contenido ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
      >
        {/* Badge superior */}
        <motion.div variants={fadeInDown} className="mb-6 md:mb-8">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-accent-400" />
            3 Puestos en Mercado Mutualista
          </span>
        </motion.div>

        {/* Logo grande */}
        <motion.div variants={fadeInDown} className="mb-4 md:mb-6">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight">
            <span className="text-primary-400">LUKESS</span>
            <span className="text-accent-400 font-light tracking-widest ml-2 sm:ml-4 text-2xl sm:text-3xl md:text-5xl align-middle">
              HOME
            </span>
          </h2>
        </motion.div>

        {/* Título H1 */}
        <motion.h1
          variants={fadeInUp}
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 md:mb-6"
        >
          Ropa Masculina de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500">
            Calidad
          </span>{" "}
          en Santa Cruz
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={fadeInUp}
          className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
        >
          Más de 10 años vistiendo a bolivianos con estilo. Camisas, pantalones,
          chaquetas, gorras y accesorios al mejor precio.
        </motion.p>

        {/* Línea decorativa */}
        <motion.div
          variants={scaleIn}
          className="flex items-center justify-center gap-3 mb-8 md:mb-10"
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent-400" />
          <span className="w-2 h-2 rounded-full bg-accent-400" />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent-400" />
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Botón primario – Ver Catálogo */}
          <a
            href="#catalogo"
            className="group relative inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 shadow-xl shadow-primary-500/30 w-full sm:w-auto"
            aria-label="Ver catálogo de productos"
          >
            Ver Catálogo
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
          </a>

          {/* Botón secundario – WhatsApp */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 shadow-xl shadow-whatsapp/30 w-full sm:w-auto"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            WhatsApp
          </a>
        </motion.div>

        {/* Indicadores de confianza */}
        <motion.div
          variants={fadeInUp}
          className="mt-10 md:mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-white/50 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-whatsapp animate-pulse" />
            Atención inmediata
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse [animation-delay:0.5s]" />
            +10 años de experiencia
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse [animation-delay:1s]" />
            3 puestos disponibles
          </div>
        </motion.div>
      </motion.div>

      {/* ── Flecha de scroll ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <a
          href="#ubicacion"
          aria-label="Explorar más contenido"
          className="flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors group"
        >
          <span className="text-xs tracking-widest uppercase">Explorar</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" as const }}
          >
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}
