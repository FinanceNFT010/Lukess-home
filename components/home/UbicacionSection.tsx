"use client";

import { MapPin, Clock, Phone, MessageCircle, Bus, ParkingCircle, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Container from "@/components/ui/Container";

/* ───────── Constantes ───────── */

const WHATSAPP_URL =
  "https://wa.me/59176020369?text=Hola%20Lukess%20Home%2C%20quiero%20consultar%20sobre%20sus%20productos";

const MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3798.537!2d-63.161667!3d-17.762778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDQ1JzQ2LjAiUyA2M8KwMDknNDIuMCJX!5e0!3m2!1ses!2sbo!4v1234567890";

const comoLlegar = [
  {
    icon: Bus,
    texto: "Líneas de bus: 3, 6, 14, 15, 16, 27, 28, 48",
  },
  {
    icon: Landmark,
    texto: "Referencia: Tercer Anillo Externo",
  },
  {
    icon: ParkingCircle,
    texto: "Amplio parqueo disponible",
  },
];

/* ───────── Variantes de animación ───────── */

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
} as const;

const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* ───────── Componente ───────── */

export default function UbicacionSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="contacto" className="py-20 md:py-28 bg-secondary-50/60">
      <Container>
        <motion.div
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* ── Encabezado centrado ── */}
          <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
              <MapPin className="w-3.5 h-3.5" />
              Ubicación
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-800 mb-4">
              Encuéntranos en el{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                Mercado Mutualista
              </span>
            </h2>

            <div className="flex items-center justify-center gap-3 mt-5">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary-300" />
            </div>
          </motion.div>

          {/* ── Contenido 2 columnas ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* ── Columna izquierda – Información ── */}
            <motion.div variants={slideLeft} className="space-y-8">
              {/* Dirección */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-secondary-800 uppercase tracking-wide mb-1">
                    Dirección
                  </h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">
                    Av. Mutualista y Tercer Anillo Externo
                  </p>
                  <p className="text-secondary-400 text-sm">
                    Santa Cruz de la Sierra, Bolivia
                  </p>
                </div>
              </div>

              {/* Horario */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-secondary-800 uppercase tracking-wide mb-1">
                    Horario de Atención
                  </h3>
                  <p className="text-secondary-600 text-sm">
                    Lunes a Sábado: 8:00 AM - 10:00 PM
                  </p>
                  <p className="text-secondary-600 text-sm">
                    Domingo: 9:00 AM - 9:00 PM
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-secondary-800 uppercase tracking-wide mb-1">
                    Teléfono
                  </h3>
                  <a
                    href="tel:+59176020369"
                    className="text-primary-500 hover:text-primary-700 text-sm font-semibold transition-colors"
                  >
                    (+591) 76020369
                  </a>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-whatsapp hover:bg-whatsapp-dark text-white px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-whatsapp/20 w-full sm:w-auto sm:inline-flex"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Chatea con Nosotros</p>
                  <p className="text-xs text-white/80">
                    Respuesta inmediata por WhatsApp
                  </p>
                </div>
              </a>

              {/* Cómo llegar */}
              <div className="bg-white rounded-2xl border border-secondary-100 p-5">
                <h3 className="text-sm font-semibold text-secondary-800 uppercase tracking-wide mb-4">
                  Cómo Llegar
                </h3>
                <ul className="space-y-3">
                  {comoLlegar.map((item) => (
                    <li
                      key={item.texto}
                      className="flex items-center gap-3 text-sm text-secondary-600"
                    >
                      <item.icon className="w-4 h-4 text-primary-400 shrink-0" />
                      {item.texto}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* ── Columna derecha – Mapa ── */}
            <motion.div variants={slideRight} className="relative">
              {/* Marco decorativo */}
              <div className="absolute -inset-2 bg-gradient-to-br from-primary-200 via-primary-100 to-accent-100 rounded-[20px] opacity-60 blur-sm" />

              <div className="relative bg-white rounded-2xl border-2 border-primary-300 overflow-hidden shadow-xl shadow-primary-500/10">
                <iframe
                  src={MAPS_EMBED_SRC}
                  width="100%"
                  height="480"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Lukess Home en Mercado Mutualista, Santa Cruz"
                  className="w-full"
                />

                {/* Barra inferior */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-secondary-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    <span className="text-xs text-secondary-500 font-medium">
                      Mercado Mutualista
                    </span>
                  </div>
                  <a
                    href="https://www.google.com/maps?q=-17.762778,-63.161667"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-500 hover:text-primary-700 font-semibold transition-colors"
                  >
                    Abrir en Google Maps &rarr;
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
