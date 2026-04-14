"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, ShoppingCart, Heart, Star, Truck, Info } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { categoryLabelFromSlug } from "@/lib/categoryLabels";
import { ProductImageMagnifier } from "./ProductImageMagnifier";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

/** Por encima del header (z-50–110), filtros sticky y bottom nav */
const MODAL_Z = "z-[500]";

export const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const { addToCart } = useCart();

  useEffect(() => {
    if (!product) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prev;
    };
  }, [product, onClose]);

  if (!product) return null;
  if (typeof document === "undefined") return null;

  const imageSrc = product.image;
  const inStock = (product.stock ?? 0) > 0;
  const categoryLabel = categoryLabelFromSlug(product.category);

  return createPortal(
    <AnimatePresence>
      {product && (
        <div
          className={`fixed inset-0 ${MODAL_Z} flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden isolate`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          {/* Modal: hoja abajo en móvil, centrado en desktop */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className={cn(
              "relative bg-white w-full md:w-[min(92vw,56rem)] lg:max-w-5xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-[1]",
              "max-h-[min(92dvh,calc(100svh-0.5rem))] md:max-h-[min(88vh,820px)] rounded-t-[1.75rem] md:rounded-[2rem] lg:rounded-[2.5rem]",
              "pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-0"
            )}
          >
            {/* Franja tipo “sheet” */}
            <div className="w-10 h-1 bg-gray-200/90 rounded-full mx-auto mt-3 mb-1 md:hidden shrink-0" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 md:top-6 md:right-6 z-50 p-2 md:p-2.5 bg-white/90 md:bg-gray-100/80 backdrop-blur-md hover:bg-gray-100 rounded-full text-gray-600 shadow-sm border border-gray-100/80 md:border-0 transition-all active:scale-95"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Imagen + lupa (desktop: dos columnas imagen + zoom) */}
            <div className="w-full md:w-[52%] lg:w-[50%] h-[min(42vh,300px)] md:h-auto md:min-h-[min(420px,70vh)] bg-gradient-to-b from-white to-gray-50/80 md:bg-gradient-to-br md:from-white md:to-gray-50/40 relative flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-gray-100/90">
              <div className="relative flex-1 min-h-0 w-full px-3 pt-2 pb-2 md:p-5 md:pb-5 lg:p-8">
                <ProductImageMagnifier src={imageSrc} alt={product.name} className="h-full min-h-[140px] md:min-h-[300px]" />
              </div>

              {/* Status Badges */}
              <div className="absolute top-2 left-4 md:top-8 md:left-8 z-20 flex flex-col gap-1.5 pointer-events-none max-w-[55%]">
                 <span className="bg-pink-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg w-fit">
                    NUEVO
                 </span>
                 <span className="bg-btn-blue text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1 w-fit">
                    <Star className="w-3 h-3 fill-current" />
                    BESTSELLER
                 </span>
              </div>
            </div>

            {/* Detalles + scroll interno */}
            <div className="w-full md:w-[48%] lg:w-[50%] flex flex-col min-h-0 flex-1 bg-gradient-to-b from-[#f0f7ff] to-white md:from-[#fafcff] md:to-white relative border-t md:border-t-0 border-gray-100/80">
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-8 lg:px-10 md:py-8 lg:py-10 min-h-0">
                <div className="space-y-5 md:space-y-8">
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-2">
                       <span className="w-6 md:w-8 h-[2px] bg-btn-blue/30" />
                       <p className="text-btn-blue text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em]">{categoryLabel}</p>
                    </div>
                    <h2 className="text-xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight pr-10 md:pr-0">
                      {product.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2 md:gap-4">
                    <span className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={cn(
                        "font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0",
                        inStock
                          ? "text-green-600 bg-green-50"
                          : "text-amber-700 bg-amber-50"
                      )}
                    >
                       <span className={cn("w-2 h-2 rounded-full", inStock ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
                       {inStock ? "En stock" : "Sin stock"}
                    </span>
                  </div>

                  <div className="space-y-2 md:space-y-4">
                    <p className="text-gray-400 text-[10px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-btn-blue shrink-0" /> Descripción
                    </p>
                    <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-lg">
                      {product.description || "Esta prenda exclusiva de Mundo Emma combina estilo y suavidad, garantizando la comodidad total para la piel de tu bebé con materiales de alta calidad."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 md:gap-4 pb-2 md:pb-0">
                     <div className="flex flex-col gap-1 p-4 rounded-[1.5rem] bg-blue-50/30 border border-blue-100/50">
                        <Truck className="w-5 h-5 text-btn-blue mb-1" />
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Envío Gratis</span>
                        <span className="text-[9px] text-gray-500 font-bold">A todo el país</span>
                     </div>
                     <div className="flex flex-col gap-1 p-4 rounded-[1.5rem] bg-pink-50/30 border border-pink-100/50">
                        <Heart className="w-5 h-5 text-pink-500 mb-1" />
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Garantía Real</span>
                        <span className="text-[9px] text-gray-500 font-bold">Calidad Emma</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 p-4 md:p-10 pt-3 md:pt-4 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex items-center gap-3 md:gap-4">
                <button 
                  type="button"
                  disabled={!inStock}
                  onClick={() => { if (inStock) { addToCart(product); onClose(); } }}
                  className={cn(
                    "flex-1 text-white h-12 md:h-16 rounded-2xl md:rounded-3xl font-black uppercase tracking-wider md:tracking-widest text-[11px] md:text-sm flex items-center justify-center gap-2 md:gap-3 shadow-lg transition-all",
                    inStock
                      ? "bg-btn-blue shadow-blue-200/80 hover:shadow-xl active:scale-[0.98]"
                      : "bg-gray-300 cursor-not-allowed shadow-none"
                  )}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {inStock ? "Agregar al carrito" : "No disponible"}
                </button>
                <button type="button" className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border-2 border-gray-100 rounded-2xl md:rounded-3xl text-gray-400 hover:text-pink-500 hover:border-pink-200 transition-all active:scale-95 bg-white shadow-sm shrink-0" aria-label="Favoritos">
                  <Heart className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
