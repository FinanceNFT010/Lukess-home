"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Container from "@/components/ui/Container";

/* ───────── Tipos ───────── */

interface Testimonio {
  id: number;
  nombre: string;
  ciudad: string;
  rating: number;
  texto: string;
  iniciales: string;
}

/* ───────── Datos ───────── */

const testimonios: Testimonio[] = [
  {
    id: 1,
    nombre: "Carlos Mendoza",
    ciudad: "Santa Cruz",
    rating: 5,
    iniciales: "CM",
    texto:
      "Compro en Lukess Home desde hace 5 años. La calidad de la ropa es excelente y los precios justos. Siempre encuentro lo que busco en sus 3 puestos.",
  },
  {
    id: 2,
    nombre: "Roberto Vásquez",
    ciudad: "Santa Cruz",
    rating: 5,
    iniciales: "RV",
    texto:
      "Atención personalizada y variedad de tallas. Me vistieron para mi boda completo, desde la camisa hasta los zapatos. 100% recomendado.",
  },
  {
    id: 3,
    nombre: "Fernando Silva",
    ciudad: "Warnes",
    rating: 5,
    iniciales: "FS",
    texto:
      "La mejor tienda de ropa masculina en el Mercado Mutualista. Precios accesibles y ropa de calidad. Vale la pena el viaje desde Warnes.",
  },
  {
    id: 4,
    nombre: "Diego Rojas",
    ciudad: "Santa Cruz",
    rating: 5,
    iniciales: "DR",
    texto:
      "10 años visitando Lukess Home y nunca me decepcionan. Tienen las últimas tendencias a precios que no vas a encontrar en otro lado.",
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/* ───────── Componente Estrellas ───────── */

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < count
              ? "text-accent-500 fill-accent-500"
              : "text-secondary-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ───────── Componente Card ───────── */

function TestimonioCard({ testimonio }: { testimonio: Testimonio }) {
  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-6 lg:p-8 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 h-full flex flex-col">
      {/* Comillas decorativas */}
      <div className="mb-4">
        <Quote className="w-8 h-8 text-primary-200" />
      </div>

      {/* Texto */}
      <p className="text-secondary-600 text-sm sm:text-base italic leading-relaxed flex-1 mb-6">
        &ldquo;{testimonio.texto}&rdquo;
      </p>

      {/* Rating */}
      <div className="mb-4">
        <StarRating count={testimonio.rating} />
      </div>

      {/* Autor */}
      <div className="flex items-center gap-3 pt-4 border-t border-secondary-100">
        {/* Avatar con iniciales */}
        <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">
            {testimonio.iniciales}
          </span>
        </div>

        <div>
          <p className="text-sm font-bold text-secondary-800">
            {testimonio.nombre}
          </p>
          <p className="text-xs text-secondary-400">{testimonio.ciudad}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────── Componente Principal ───────── */

export default function TestimoniosSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  /* ── Scroll programático ── */
  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.children[index] as HTMLElement | undefined;
    if (!card) return;

    container.scrollTo({
      left: card.offsetLeft - container.offsetLeft,
      behavior: "smooth",
    });
  }, []);

  /* ── Detectar scroll manual para sincronizar dots ── */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.children[0]
        ? (container.children[0] as HTMLElement).offsetWidth
        : 1;
      const gap = 20; // gap-5 = 1.25rem ≈ 20px
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(newIndex, testimonios.length - 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Auto-play cada 5s ── */
  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % testimonios.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
  }, [scrollToIndex]);

  useEffect(() => {
    if (inView) resetAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [inView, resetAutoPlay]);

  /* ── Click en dot ── */
  const goTo = (index: number) => {
    setActiveIndex(index);
    scrollToIndex(index);
    resetAutoPlay();
  };

  return (
    <section id="testimonios" className="py-20 md:py-28 bg-white">
      <Container>
        <motion.div
          ref={inViewRef}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* ── Encabezado ── */}
          <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
              <Star className="w-3.5 h-3.5 fill-accent-500 text-accent-500" />
              Testimonios
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-800 mb-4">
              Lo Que Dicen Nuestros{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                Clientes
              </span>
            </h2>

            <p className="text-secondary-500 text-base md:text-lg max-w-xl mx-auto">
              La satisfacción de nuestros clientes es nuestra prioridad
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-300" />
            </div>
          </motion.div>

          {/* ── Carousel ── */}
          <motion.div variants={fadeInUp}>
            {/* Scroll container */}
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
              onMouseEnter={() => {
                if (autoPlayRef.current) clearInterval(autoPlayRef.current);
              }}
              onMouseLeave={() => resetAutoPlay()}
              onTouchStart={() => {
                if (autoPlayRef.current) clearInterval(autoPlayRef.current);
              }}
              onTouchEnd={() => resetAutoPlay()}
            >
              {/* Ocultar scrollbar vía className extra */}
              {testimonios.map((testimonio) => (
                <div
                  key={testimonio.id}
                  className="snap-start shrink-0 w-[85vw] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
                >
                  <TestimonioCard testimonio={testimonio} />
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonios.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ir al testimonio ${i + 1}`}
                  className={`
                    rounded-full transition-all duration-300
                    ${
                      activeIndex === i
                        ? "w-8 h-2.5 bg-primary-500"
                        : "w-2.5 h-2.5 bg-secondary-300 hover:bg-primary-300"
                    }
                  `}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
