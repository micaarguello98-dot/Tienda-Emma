"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useSellerWhatsApp } from "@/hooks/useSellerWhatsApp";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const HELP_TEXT =
  "Configura el número de WhatsApp en Administración → Configuración.";

export const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { digits, loading, configured } = useSellerWhatsApp();

  const consultUrl = configured
    ? buildWhatsAppUrl(
        digits,
        "Hola, tengo una consulta sobre Mundo Emma."
      )
    : null;

  const openOrWarn = () => {
    if (consultUrl) {
      window.open(consultUrl, "_blank", "noopener,noreferrer");
      return;
    }
    alert(HELP_TEXT);
  };

  return (
    <div className="fixed bottom-[5.5rem] right-4 md:bottom-[6.5rem] md:right-8 z-[85] flex flex-row items-center gap-3 pointer-events-none opacity-75 hover:opacity-100 md:opacity-100 transition-opacity duration-300">
      <motion.div
        animate={{ x: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl rounded-tr-sm rounded-br-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-primary-blue relative pointer-events-auto cursor-pointer flex items-center gap-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openOrWarn}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && openOrWarn()}
      >
        <p className="text-[13px] font-black text-gray-700 tracking-tight whitespace-nowrap">
          ¡Hola! ¿Dudas?
        </p>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
        </motion.div>
        <div className="absolute top-1/2 -mt-[7px] -right-[7.5px] w-3 h-3 bg-white border-t-2 border-r-2 border-primary-blue rotate-45 rounded-[1px]" />
      </motion.div>

      <motion.a
        href={consultUrl ?? "#"}
        target={consultUrl ? "_blank" : undefined}
        rel={consultUrl ? "noopener noreferrer" : undefined}
        onClick={(e) => {
          if (!consultUrl) {
            e.preventDefault();
            openOrWarn();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
        whileTap={{ scale: 0.95 }}
        aria-busy={loading}
        aria-label="Abrir WhatsApp"
        className="w-[60px] h-[60px] bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.4)] flex items-center justify-center border-[3px] border-white overflow-visible relative group pointer-events-auto"
      >
        <div className="absolute inset-1 rounded-full border border-white/40" />
        <div
          className={
            isHovered
              ? "absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-60"
              : "hidden"
          }
        />
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 text-white fill-current relative z-10"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 0 1 1.469 11.81c0-5.446 4.434-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.006 5.45-4.439 9.886-9.885 9.886l.001.002zM12.056.241C5.558.241.267 5.534.267 12.032a11.77 11.77 0 0 0 1.59 5.923L0 24l6.195-1.625a11.785 11.785 0 0 0 5.86 1.564v-.002c6.495 0 11.788-5.293 11.789-11.791.001-3.149-1.222-6.108-3.447-8.334A11.745 11.745 0 0 0 12.056.241" />
        </svg>
      </motion.a>
    </div>
  );
};
