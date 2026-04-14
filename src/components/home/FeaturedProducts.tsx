"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { Product } from "@/types/product";
import { Loader2, Sparkles } from "lucide-react";

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            categories(slug),
            product_images(url, is_primary)
          `
          )
          .eq("is_featured", true)
          .order("id", { ascending: false })
          .limit(12);

        if (error) throw error;

        const mapped: Product[] = (data || []).map((p: any) => {
          const cat = p.categories;
          const slug = Array.isArray(cat) ? cat[0]?.slug : cat?.slug;
          return {
            id: p.id,
            name: p.name,
            description: p.description || "",
            price: Number(p.price),
            image:
              p.product_images?.find((img: { is_primary?: boolean }) => img.is_primary)?.url ||
              p.product_images?.[0]?.url ||
              "/logo.png",
            category: (slug as Product["category"]) || "accesorios",
            stock: p.stock || 0,
            is_featured: true,
          };
        });

        setProducts(mapped);
      } catch (e) {
        console.error("Featured products:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, [supabase]);

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-white to-blue-50/30 px-4 md:px-6 py-10 border-b border-blue-100/50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-center gap-3 py-12 text-btn-blue">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <>
      <section className="w-full bg-gradient-to-b from-white to-blue-50/30 px-4 md:px-6 py-10 border-b border-blue-100/50">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-10 h-10 rounded-2xl bg-btn-blue text-white flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">
                Productos <span className="text-btn-blue">destacados</span>
              </h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">
                Elegidos para el inicio
              </p>
            </div>
          </div>

          <div className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 md:pb-4 scrollbar-thin -mx-1 px-1">
            {products.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-[46%] sm:w-[38%] md:w-[240px] lg:w-[260px]"
              >
                <ProductCard product={product} onClick={(p) => setSelected(p)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
};
