"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProductCard } from "@/components/home/ProductCard";
import { ProductModal } from "@/components/home/ProductModal";
import { createClient } from "@/utils/supabase/client";
import { useFavorites } from "@/context/FavoritesContext";
import { Product } from "@/types/product";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { ids } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
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
          .in("id", ids);

        if (error) throw error;

        const mapped: Product[] = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          price: Number(p.price),
          image:
            p.product_images?.find((img: any) => img.is_primary)?.url ||
            p.product_images?.[0]?.url ||
            "/logo.png",
          category: p.categories?.slug || "accesorios",
          stock: p.stock || 0,
          is_featured: Boolean(p.is_featured),
        }));

        const order = new Map(ids.map((id, i) => [id, i]));
        mapped.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

        setProducts(mapped);
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ids, supabase]);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <Header />

      <main className="max-w-screen-2xl mx-auto pt-28 md:pt-32 px-4 md:px-6">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">
              Mis <span className="text-btn-blue">favoritos</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Los productos que marcas con el corazón se guardan en este dispositivo.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-btn-blue" />
          </div>
        ) : ids.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 md:p-14 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Aún no tienes favoritos</h2>
            <p className="text-gray-500 text-sm font-medium mb-8">
              Toca el corazón en cualquier producto para guardarlo aquí.
            </p>
            <Link
              href="/"
              className="inline-block bg-btn-blue text-white font-black uppercase tracking-widest text-xs py-4 px-8 rounded-2xl shadow-lg shadow-blue-200"
            >
              Ir al inicio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onClick={(p) => setSelected(p)} />
            ))}
          </div>
        )}
      </main>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
      <BottomNav />
    </div>
  );
}
