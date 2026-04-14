"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { imagePath } from "@/lib/utils";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HangerBow = () => (
  <svg 
    width="120" 
    height="80" 
    viewBox="0 0 100 60" 
    fill="none" 
    stroke="#333" 
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mt-4 drop-shadow-sm"
  >
    <path d="M50 30 C50 15, 65 15, 65 22 C65 28, 50 30, 50 35" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 35 L20 55 L80 55 Z" strokeWidth="2" strokeLinejoin="round" />
    <g transform="translate(50, 55)">
      <path d="M-2 0 C-15 -15, -25 -5, -4 4 Z" fill="#ffb6c1" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
      <path d="M2 0 C15 -15, 25 -5, 4 4 Z" fill="#ffb6c1" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="0" cy="0" r="4" fill="#ffb6c1" stroke="#333" strokeWidth="2" />
    </g>
  </svg>
);

const CATEGORY_INFO: Record<string, { label: string, range: string }> = {
  "BEBÉS": { label: "Bebés", range: "0-24m" },
  "NIÑAS": { label: "Niñas", range: "2-10 años" },
  "NIÑOS": { label: "Niños", range: "2-10 años" },
  "ACCESORIOS": { label: "Accesorios", range: "Para todos" },
};

const TinyCloud = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 16" 
    fill="white" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18 16H6C2.686 16 0 13.314 0 10C0 6.845 2.422 4.269 5.514 4.026C6.46 1.705 8.654 0 11.25 0C14.417 0 16.892 2.213 17.433 5.163C20.573 5.485 23 8.163 23 11.25C23 13.873 20.873 16 18 16Z" />
  </svg>
);

export const Hero = ({ 
  activeCategory,
  onStoreClick 
}: { 
  activeCategory?: string | null;
  onStoreClick?: () => void;
}) => {
  const [config, setConfig] = useState({ title: "Adorable ropa para \n tus pequeños", subtitle: "¡BIENVENIDOS AL MUNDO DE EMMA!" });
  const supabase = createClient();

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('site_config').select('*');
      if (data) {
        const title = data.find((i: any) => i.key === 'hero_title')?.value || "Adorable ropa para \n tus pequeños";
        const subtitle = data.find((i: any) => i.key === 'hero_subtitle')?.value || "¡BIENVENIDOS AL MUNDO DE EMMA!";
        setConfig({ title, subtitle });
      }
    }
    fetchConfig();
  }, []);

  const catInfo = activeCategory ? CATEGORY_INFO[activeCategory] : null;

  return (
    <section className="mt-[74px] md:mt-24 relative overflow-hidden cloud-bg pt-10 pb-16 md:pb-12 px-6">
      {/* Nubes y Estrellas original (Restaurado) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Star className="absolute top-12 left-[20%] w-4 h-4 text-accent-yellow fill-accent-yellow opacity-80 animate-pulse" />
        <Star className="absolute top-32 left-[10%] w-3 h-3 text-accent-yellow fill-accent-yellow opacity-60 animate-pulse" />
        <Star className="absolute top-20 right-[30%] w-5 h-5 text-accent-yellow fill-accent-yellow opacity-70 animate-pulse" />
        <motion.div animate={{ x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute z-0 top-8 right-12">
          <TinyCloud className="w-16 h-10 opacity-80" />
        </motion.div>
        <motion.div animate={{ x: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 1 }} className="absolute z-0 top-28 right-4">
          <TinyCloud className="w-12 h-8 opacity-60" />
        </motion.div>
        <motion.div animate={{ x: [0, 25, 0] }} transition={{ repeat: Infinity, duration: 14, ease: "easeInOut", delay: 2 }} className="absolute z-0 bottom-24 left-8">
          <TinyCloud className="w-20 h-12 opacity-70" />
        </motion.div>
      </div>

      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
        {/* Lado Izquierdo: Textos Dinámicos */}
        <div className="w-full md:w-1/2 text-center items-center md:items-start justify-center flex flex-col z-10 relative pt-2 md:pt-0">
          <AnimatePresence mode="wait">
            {!catInfo ? (
              <motion.div
                key="default-hero"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex flex-col items-center md:items-start text-center md:text-left w-full"
              >
                <p className="text-gray-800 font-medium mb-1 tracking-tight text-[15px] md:text-base uppercase tracking-widest">
                  {config.subtitle}
                </p>
                <h1 className="text-[2.2rem] md:text-5xl font-black text-gray-900 leading-[1.02] mb-6 md:mb-8 tracking-tighter whitespace-pre-line text-balance">
                  {config.title}
                </h1>
                <button
                  onClick={onStoreClick}
                  className="bg-white text-gray-900 font-black px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  VER TODO 
                  <ArrowRight className="w-5 h-5 text-btn-blue" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="category-hero"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center justify-center w-full"
              >
                <p className="text-gray-800 text-lg md:text-xl font-medium tracking-tight mb-[-5px]">Colección</p>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight uppercase">{catInfo.label}</h1>
                <p className="text-gray-700 text-lg md:text-xl font-medium tracking-tight mt-1">{catInfo.range}</p>
                <HangerBow />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lado Derecho: Imágenes Fotográficas original (Restaurado) */}
        <div className="w-full md:w-1/2 relative z-10 flex justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative w-full max-w-[480px] md:max-w-[550px] flex items-center justify-center -mb-8 md:-mb-12 mt-4 md:mt-0"
          >
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-75" />
            
            {/* Animaciones de prendas flotantes originales */}
            <motion.div animate={{ y: [0, -8, 0], rotate: [-4, 0, -4] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }} className="absolute z-20 top-[0%] -left-[5%] md:-left-[10%] w-[35%] drop-shadow-xl">
              <Image src={imagePath("/1.png")} alt="Prenda 1" width={180} height={180} className="w-full h-auto object-contain" />
            </motion.div>

            <motion.div animate={{ y: [0, 8, 0], rotate: [6, -2, 6] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} className="absolute z-20 top-[10%] -right-[5%] md:-right-[5%] w-[28%] md:w-[32%] drop-shadow-xl">
              <Image src={imagePath("/2.png")} alt="Prenda 2" width={180} height={180} className="w-full h-auto object-contain" />
            </motion.div>

            <motion.div animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.5 }} className="absolute z-20 bottom-[15%] -left-[10%] w-[40%] drop-shadow-lg">
              <Image src={imagePath("/3.png")} alt="Prenda 3" width={220} height={220} className="w-full h-auto object-contain" />
            </motion.div>

            <motion.div animate={{ y: [0, 10, 0], rotate: [8, 0, 8] }} transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 1.5 }} className="absolute z-20 bottom-[5%] -right-[15%] md:-right-[10%] w-[42%] drop-shadow-xl">
              <Image src={imagePath("/4.png")} alt="Prenda 4" width={220} height={220} className="w-full h-auto object-contain" />
            </motion.div>

            {/* Niña Central Reincorporada */}
            <Image
              src={imagePath("/niña2.png")}
              alt="Niña Mundo Emma 2"
              width={600}
              height={600}
              className="relative w-[70%] md:w-[65%] h-auto object-contain drop-shadow-2xl z-10 hover:scale-[1.03] transition-transform duration-500"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};


