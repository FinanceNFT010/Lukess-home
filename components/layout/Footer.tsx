import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  ExternalLink,
  Heart,
} from "lucide-react";
import Container from "@/components/ui/Container";

/* ───────── Constantes ───────── */

const WHATSAPP_URL =
  "https://wa.me/59176020369?text=Hola%20Lukess%20Home%2C%20me%20interesa%20conocer%20sus%20productos";

const quickLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#contacto", label: "Contacto" },
];

const socialLinks = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@lukess.home",
    handle: "@lukess.home",
  },
  {
    label: "WhatsApp",
    href: WHATSAPP_URL,
    handle: "76020369",
  },
  {
    label: "Facebook",
    href: "#",
    handle: "Lukess Home",
  },
  {
    label: "Instagram",
    href: "#",
    handle: "@lukess.home",
  },
];

/* ───────── Componente ───────── */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 text-white">
      {/* ── Contenido principal ── */}
      <Container>
        <div className="py-14 md:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* ── Col 1: Sobre Nosotros ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="mb-5">
              <span className="text-2xl font-bold tracking-tight">LUKESS</span>
              <span className="text-accent-400 text-sm font-light tracking-widest uppercase ml-2">
                Home
              </span>
            </div>

            <p className="text-secondary-400 text-sm leading-relaxed mb-6">
              Más de 10 años vistiendo a bolivianos con calidad y estilo. 3
              puestos en el Mercado Mutualista, Santa Cruz de la Sierra.
            </p>

            {/* Redes sociales */}
            <div className="space-y-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-secondary-400 hover:text-primary-400 transition-colors text-sm group"
                >
                  <span className="w-8 h-8 bg-secondary-800 group-hover:bg-primary-500/10 rounded-lg flex items-center justify-center transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-xs text-secondary-500 block leading-none mb-0.5">
                      {social.label}
                    </span>
                    <span className="text-sm">{social.handle}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Enlaces Rápidos ── */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-400 mb-5">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-400 hover:text-primary-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-secondary-600 group-hover:bg-primary-400 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Botón WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-whatsapp/10 hover:bg-whatsapp/20 text-whatsapp px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 mt-6"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chatea con nosotros
            </a>
          </div>

          {/* ── Col 3: Horarios ── */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-400 mb-5">
              Horarios
            </h3>

            <div className="space-y-4">
              {/* Lun-Sáb */}
              <div className="bg-secondary-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary-400" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wide">
                    Lunes - Sábado
                  </span>
                </div>
                <p className="text-secondary-300 text-sm ml-6">
                  8:00 AM - 10:00 PM
                </p>
              </div>

              {/* Dom */}
              <div className="bg-secondary-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-accent-400" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wide">
                    Domingo
                  </span>
                </div>
                <p className="text-secondary-300 text-sm ml-6">
                  9:00 AM - 9:00 PM
                </p>
              </div>

              {/* Indicador */}
              <div className="flex items-center gap-2 text-xs text-secondary-500">
                <span className="w-2 h-2 rounded-full bg-whatsapp animate-pulse" />
                Abierto todos los días
              </div>
            </div>
          </div>

          {/* ── Col 4: Contacto ── */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-400 mb-5">
              Contacto
            </h3>

            <div className="space-y-5">
              {/* Teléfono */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-secondary-800 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <span className="text-xs text-secondary-500 block mb-0.5">
                    Teléfono / WhatsApp
                  </span>
                  <a
                    href="tel:+59176020369"
                    className="text-sm text-secondary-300 hover:text-primary-400 transition-colors font-medium"
                  >
                    (+591) 76020369
                  </a>
                </div>
              </div>

              {/* Dirección */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-secondary-800 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <span className="text-xs text-secondary-500 block mb-0.5">
                    Dirección
                  </span>
                  <p className="text-sm text-secondary-300 leading-relaxed">
                    Mercado Mutualista
                    <br />
                    Av. Mutualista y 3er Anillo
                    <br />
                    Santa Cruz, Bolivia
                  </p>
                </div>
              </div>

              {/* Puestos */}
              <div className="bg-secondary-800/60 rounded-xl p-3">
                <p className="text-xs text-secondary-500 font-medium mb-2">
                  Nuestros Puestos:
                </p>
                <div className="space-y-1 text-xs text-secondary-400">
                  <p>• Pasillo -2, Caseta 47-48</p>
                  <p>• Pasillo -3, Caseta 123</p>
                  <p>• Pasillo -5, Caseta 228-229</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ── Footer Bottom ── */}
      <div className="bg-secondary-900 border-t border-secondary-800">
        <Container>
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-secondary-500 text-xs">
              &copy; {currentYear} Lukess Home. Todos los derechos reservados.
            </p>
            <p className="text-secondary-600 text-xs flex items-center gap-1">
              Hecho con{" "}
              <Heart className="w-3 h-3 text-red-500 fill-red-500" /> en Santa
              Cruz, Bolivia
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
