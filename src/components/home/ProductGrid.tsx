"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { Product } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShoppingBag } from "lucide-react";

interface ProductGridProps {
  activeCategory?: string | null;
  sortBy?: string;
}

export const ProductGrid = ({ activeCategory, sortBy }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const supabase = createClient();

  // Translate capsule labels to category slugs
  const categoryMap: Record<string, string> = {
    "BEBÉS": "bebes",
    "NIÑAS": "ninas",
    "NIÑOS": "ninos",
    "ACCESORIOS": "accesorios"
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const slug = activeCategory ? categoryMap[activeCategory] : null;

        // Sin categoría: join normal. Con categoría: !inner para que el filtro por slug funcione (PostgREST).
        const selectWithCategory = slug
          ? `
            *,
            categories!inner(slug),
            product_images(url, is_primary)
          `
          : `
            *,
            categories(slug),
            product_images(url, is_primary)
          `;

        let query = supabase.from("products").select(selectWithCategory);

        if (slug) {
          query = query.eq("categories.slug", slug);
        }

        const { data, error } = await query;

        if (error) throw error;

        const mappedProducts: Product[] = (data || []).map((p: any) => {
          const allImages = (p.product_images || [])
            .sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
            .map((img: any) => img.url)
            .filter(Boolean);

          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price),
            image: allImages[0] || '/logo.png',
            images: allImages.length > 0 ? allImages : undefined,
            category: p.categories?.slug || 'accesorios',
            stock: p.stock || 0,
            is_featured: Boolean(p.is_featured),
          };
        });

        // Sorting
        if (sortBy === "price_asc") {
          mappedProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price_desc") {
          mappedProducts.sort((a, b) => b.price - a.price);
        }

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory, sortBy]);

  if (loading) {
    return (
      <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 mb-24 max-w-screen-2xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-[2rem] aspect-[3/4] shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="px-4 md:px-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8 mb-24 max-w-screen-2xl mx-auto">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onClick={(p) => setSelectedProduct(p)}
          />
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2 shadow-inner">
               <ShoppingBag className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 font-black text-lg uppercase tracking-tight">No hay productos aquí</p>
            <p className="text-gray-400 text-sm font-medium">Pronto tendremos más cositas lindas para ti.</p>
          </div>
        )}
      </div>

      {/* Modal for Product Details */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </>
  );
};
