"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-md pt-8 pb-28 md:pb-32 px-6 border-t border-blue-50 mt-auto w-full">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center gap-4">
        
        {/* Navegación Rápida */}
        <div className="flex items-center gap-5 md:gap-8 text-[11px] md:text-xs font-black text-gray-700">
          <Link href="/contact" className="hover:text-btn-blue transition-colors uppercase tracking-wider">
            Contáctanos
          </Link>
          <span className="w-1 h-1 rounded-full bg-blue-200" />
          <Link href="/shipping" className="hover:text-btn-blue transition-colors uppercase tracking-wider">
            Envíos y pedidos
          </Link>
        </div>

        {/* Créditos */}
        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-center">
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
            &copy; {new Date().getFullYear()} MUNDO EMMA.
          </p>
          <span className="hidden md:block w-1 h-1 rounded-full bg-gray-200" />
          <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase flex items-center justify-center gap-1 mt-1 md:mt-0">
            Hecho con <Heart className="w-3 h-3 text-pink-400 fill-pink-400 mx-0.5 animate-pulse" /> por M y F estudio
          </p>
        </div>

      </div>
    </footer>
  );
};
