"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_URL =
  "https://wa.me/59176020369?text=Hola%20Lukess%20Home%2C%20me%20interesa%20conocer%20sus%20productos";

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(true);

  /* Mostrar después de scroll inicial */
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Auto-cerrar tooltip después de 6s */
  useEffect(() => {
    if (visible && tooltip) {
      const timer = setTimeout(() => setTooltip(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [visible, tooltip]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" as const }}
          className="fixed bottom-6 right-6 z-50 flex items-end gap-3"
        >
          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:flex items-center gap-2 bg-white rounded-xl shadow-lg border border-secondary-100 px-4 py-2.5 mb-2"
              >
                <p className="text-sm text-secondary-700 font-medium whitespace-nowrap">
                  ¿Necesitas ayuda?
                </p>
                <button
                  onClick={() => setTooltip(false)}
                  className="text-secondary-400 hover:text-secondary-600 transition-colors"
                  aria-label="Cerrar mensaje"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón flotante */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            className="group relative w-14 h-14 bg-whatsapp hover:bg-whatsapp-dark rounded-full flex items-center justify-center shadow-xl shadow-whatsapp/30 transition-all duration-300 hover:scale-110"
          >
            {/* Anillo de pulso */}
            <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-20" />

            <MessageCircle className="w-6 h-6 text-white relative z-10" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
