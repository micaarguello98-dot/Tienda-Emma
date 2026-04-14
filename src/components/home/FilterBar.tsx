"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Ruler, Palette, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FilterBarProps {
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

const SIZE_OPTIONS = ["Talle", "S", "M", "L", "XL"];
const COLOR_OPTIONS = ["Color", "Rosa", "Azul", "Blanco", "Beige"];
const SORT_OPTIONS = [
  { label: "Recomendados", value: "recommended" },
  { label: "Menor Precio", value: "price_asc" },
  { label: "Mayor Precio", value: "price_desc" }
];

export const FilterBar = ({ sortBy, onSortChange }: FilterBarProps) => {
  const [activeSize, setActiveSize] = useState("Talle");
  const [activeColor, setActiveColor] = useState("Color");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Cierra los menús al tocar fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={barRef} className="px-4 md:px-6 py-4 sticky top-14 bg-white/95 backdrop-blur-sm z-40 border-b border-gray-50 mb-4 relative">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-screen-xl mx-auto">
        
        {/* Grupo Izquierdo: Talle y Color */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {/* Talle Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 w-full md:w-auto justify-between md:justify-start",
                activeSize !== "Talle" ? "border-btn-blue text-btn-blue bg-blue-50" : "border-gray-100 text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                {activeSize}
              </div>
              <ChevronDown className={cn("w-3 h-3 transition-transform duration-300 ml-1 md:ml-0", openDropdown === "size" ? "rotate-180 text-btn-blue" : "opacity-50")} />
            </button>

            <AnimatePresence>
              {openDropdown === "size" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 w-32 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden py-2"
                >
                  {SIZE_OPTIONS.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => { setActiveSize(opt); setOpenDropdown(null); }}
                      className={cn(
                        "w-full text-left px-5 py-2.5 text-xs font-bold transition-colors hover:bg-blue-50",
                        activeSize === opt ? "text-btn-blue bg-blue-50/50" : "text-gray-600"
                      )}
                    >
                      {opt === "Talle" ? "Cualquier Talle" : opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Color Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setOpenDropdown(openDropdown === "color" ? null : "color")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 w-full md:w-auto justify-between md:justify-start",
                activeColor !== "Color" ? "border-btn-blue text-btn-blue bg-blue-50" : "border-gray-100 text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {activeColor}
              </div>
              <ChevronDown className={cn("w-3 h-3 transition-transform duration-300 ml-1 md:ml-0", openDropdown === "color" ? "rotate-180 text-btn-blue" : "opacity-50")} />
            </button>

            <AnimatePresence>
              {openDropdown === "color" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 w-40 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden py-2"
                >
                  {COLOR_OPTIONS.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => { setActiveColor(opt); setOpenDropdown(null); }}
                      className={cn(
                        "w-full text-left px-5 py-2.5 text-xs font-bold transition-colors hover:bg-blue-50 flex items-center gap-3",
                        activeColor === opt ? "text-btn-blue bg-blue-50/50" : "text-gray-600"
                      )}
                    >
                      {opt === "Color" ? (
                        <div className="w-3 h-3 rounded-full border border-gray-300 relative overflow-hidden bg-gradient-to-br from-pink-300 via-yellow-200 to-blue-300" />
                      ) : (
                        <div className={cn("w-3 h-3 rounded-full border border-gray-200 shadow-sm", 
                            opt === "Rosa" ? "bg-pink-300" : 
                            opt === "Azul" ? "bg-blue-400" : 
                            opt === "Blanco" ? "bg-white" : 
                            "bg-[#D2B48C]"
                        )} />
                      )}
                      {opt === "Color" ? "Todos" : opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Grupo Derecho: Ordenar */}
        <div className="flex flex-col items-end justify-end md:flex-row md:items-center md:ml-auto h-full">
          {/* Sort Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 w-full md:w-auto justify-between md:justify-start",
                sortBy?.startsWith("price") ? "border-btn-blue text-btn-blue bg-blue-50" : "border-gray-100 text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                {sortBy === "price_asc" ? "Menor Precio" : sortBy === "price_desc" ? "Mayor Precio" : "Ordenar"}
              </div>
              <ChevronDown className={cn("w-3 h-3 transition-transform duration-300 ml-1 md:ml-0", openDropdown === "sort" ? "rotate-180 text-btn-blue" : "opacity-50")} />
            </button>

            <AnimatePresence>
              {openDropdown === "sort" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 right-0 md:right-0 w-44 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden py-2 origin-top-right"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button 
                      key={opt.value}
                      onClick={() => { onSortChange?.(opt.value); setOpenDropdown(null); }}
                      className={cn(
                        "w-full text-left px-5 py-3 text-xs font-bold transition-colors hover:bg-blue-50",
                        (sortBy === opt.value) || (!sortBy && opt.value === "recommended") ? "text-btn-blue bg-blue-50/50" : "text-gray-600"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
