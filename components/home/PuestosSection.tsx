"use client";

import { MapPin, Clock, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Container from "@/components/ui/Container";

/* ───────── Tipos ───────── */

interface Puesto {
  id: number;
  nombre: string;
  pasillo: string;
  caseta: string;
  horario: {
    semana: string;
    domingo: string;
  };
}

/* ───────── Datos ───────── */

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps?q=-17.762778,-63.161667";

const puestos: Puesto[] = [
  {
    id: 1,
    nombre: "Puesto 1",
    pasillo: "Pasillo -2",
    caseta: "Caseta 47-48",
    horario: {
      semana: "Lun-Sáb: 8:00 AM - 10:00 PM",
      domingo: "Dom: 9:00 AM - 9:00 PM",
    },
  },
  {
    id: 2,
    nombre: "Puesto 2",
    pasillo: "Pasillo -3",
    caseta: "Caseta 123",
    horario: {
      semana: "Lun-Sáb: 8:00 AM - 10:00 PM",
      domingo: "Dom: 9:00 AM - 9:00 PM",
    },
  },
  {
    id: 3,
    nombre: "Puesto 3",
    pasillo: "Pasillo -5",
    caseta: "Caseta 228-229",
    horario: {
      semana: "Lun-Sáb: 8:00 AM - 10:00 PM",
      domingo: "Dom: 9:00 AM - 9:00 PM",
    },
  },
];

/* ───────── Variantes de animación ───────── */

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
} as const;

const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* ───────── Componente ───────── */

export default function PuestosSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  return (
    <section id="ubicacion" className="py-20 md:py-28 bg-secondary-50/50">
      <Container>
        <motion.div
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* ── Encabezado ── */}
          <motion.div variants={headingVariants} className="text-center mb-14 md:mb-16">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
              <MapPin className="w-3.5 h-3.5" />
              Nuestras ubicaciones
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-800 mb-4">
              Visítanos en Nuestros{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                3 Puestos
              </span>
            </h2>

            <p className="text-secondary-500 text-base md:text-lg max-w-xl mx-auto">
              Ubicados estratégicamente en el Mercado Mutualista para tu comodidad
            </p>

            {/* Separador */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary-300" />
            </div>
          </motion.div>

          {/* ── Grid de puestos ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {puestos.map((puesto) => (
              <motion.div
                key={puesto.id}
                variants={cardVariants}
                className="group relative bg-white rounded-2xl border-2 border-secondary-100 hover:border-primary-400 p-6 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1"
              >
                {/* Número decorativo */}
                <span className="absolute top-4 right-4 text-7xl font-black text-secondary-100 group-hover:text-primary-100 transition-colors duration-300 leading-none select-none">
                  {puesto.id}
                </span>

                {/* Icono */}
                <div className="relative z-10 w-12 h-12 bg-primary-50 group-hover:bg-primary-500 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Info */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-secondary-800 mb-1">
                    {puesto.nombre}
                  </h3>

                  <div className="space-y-1 mb-5">
                    <p className="text-primary-600 font-semibold text-sm">
                      {puesto.pasillo}
                    </p>
                    <p className="text-secondary-500 text-sm">
                      {puesto.caseta}
                    </p>
                  </div>

                  {/* Horario */}
                  <div className="flex items-start gap-2 mb-6 p-3 bg-secondary-50 rounded-xl">
                    <Clock className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <div className="text-xs text-secondary-600 leading-relaxed">
                      <p>{puesto.horario.semana}</p>
                      <p>{puesto.horario.domingo}</p>
                    </div>
                  </div>

                  {/* Botón Google Maps */}
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-700 group/link transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Ver en Google Maps</span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-200">
                      &rarr;
                    </span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Dirección general ── */}
          <motion.div
            variants={headingVariants}
            className="mt-12 md:mt-16 text-center"
          >
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white border border-secondary-200 hover:border-primary-300 rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-primary-50 group-hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors duration-300">
                <Navigation className="w-4 h-4 text-primary-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="text-left">
                <p className="text-xs text-secondary-400 font-medium">
                  Mercado Mutualista
                </p>
                <p className="text-sm text-secondary-700 font-semibold">
                  Av. Mutualista y Tercer Anillo Externo
                </p>
              </div>
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
