"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart, ShoppingBag, Eye, Star, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}  

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggle, has } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);
  const isFavorite = has(product.id);

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-3xl p-3 md:p-3.5 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/50 group flex flex-col h-full relative"
    >
      {/* Top Badges */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-1.5 max-w-[calc(100%-3rem)]">
          {product.is_featured && (
            <span className="bg-btn-blue text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-md flex items-center gap-1 w-fit">
              <Sparkles className="w-2.5 h-2.5" />
              Destacado
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm flex items-center gap-1 w-fit">
             <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
             4.9
          </span>
      </div>

      {/* Image Container with taller aspect ratio (3/4) */}
      <div 
        onClick={() => onClick?.(product)}
        className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-50/50 flex items-center justify-center cursor-pointer group"
      >
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[2px] transition-all"
            >
              <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl flex items-center gap-2 transform translate-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <Eye className="w-5 h-5 text-gray-700" />
                <span className="text-[10px] font-black uppercase tracking-widest pr-1">Ver Detalles</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favorite Button */}
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
          className={cn(
            "absolute top-2 right-2 p-2.5 rounded-full transition-all duration-300 active:scale-90 z-20",
            isFavorite ? "bg-pink-500 text-white shadow-lg shadow-pink-200" : "bg-white/90 text-gray-400 hover:text-pink-500 shadow-sm"
          )}
        >
          <Heart className={cn("w-4.5 h-4.5", isFavorite && "fill-current")} />
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-4 flex flex-col flex-1 px-1">
        <div className="flex flex-col mb-3">
          <p className="text-[10px] text-btn-blue uppercase tracking-[0.15em] font-black mb-1 opacity-70">
             {product.category}
          </p>
          <h3 
            onClick={() => onClick?.(product)}
            className="text-sm md:text-base font-black text-gray-900 line-clamp-2 min-h-[2.5rem] leading-tight hover:text-btn-blue transition-colors cursor-pointer tracking-tight"
          >
             {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-50">
           <div className="flex flex-col">
             <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Precio</span>
             <span className="text-lg md:text-xl font-black text-gray-900 tracking-tight leading-none">
               ${product.price.toFixed(2)}
             </span>
           </div>
           
           <button 
             onClick={(e) => { e.stopPropagation(); addToCart(product); }}
             className="bg-btn-blue text-white w-11 h-11 rounded-2xl flex items-center justify-center hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition-all active:scale-95 group/btn shadow-md relative overflow-hidden"
             aria-label="Añadir al carrito"
           >
             <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
             <ShoppingBag className="w-5 h-5" />
           </button>
        </div>
      </div>
    </motion.div>
  );
};
