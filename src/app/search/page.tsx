"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProductCard } from "@/components/home/ProductCard";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/product";
import { Search, ShoppingBag, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(query);
  const supabase = createClient();

  useEffect(() => {
    setInputValue(query);
    fetchSearchResults(query);
  }, [query]);

  async function fetchSearchResults(searchTerm: string) {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from('products')
        .select(`
          *,
          categories(slug),
          product_images(url, is_primary)
        `);

      if (searchTerm) {
        // Search in name or description
        supabaseQuery = supabaseQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: Number(p.price),
        image: p.product_images?.find((img: any) => img.is_primary)?.url || 
               p.product_images?.[0]?.url || 
               '/logo.png',
        category: p.categories?.slug || 'accesorios',
        stock: p.stock || 0,
        is_featured: Boolean(p.is_featured),
      }));

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Error searching products:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      window.history.pushState(null, "", `/search?q=${encodeURIComponent(inputValue.trim())}`);
      fetchSearchResults(inputValue.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <Header />
      
      <main className="max-w-screen-xl mx-auto pt-24 md:pt-32 px-4 md:px-6">
        {/* Search Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 text-gray-500 mb-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <Link href="/" className="hover:text-btn-blue transition-colors flex items-center gap-1 font-bold text-sm">
              <ArrowLeft className="w-4 h-4" /> Inicio
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400 font-medium text-sm">Búsqueda</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative group max-w-2xl">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Buscar por nombre, descripción o categoría..."
              className="w-full h-14 md:h-16 pl-14 pr-6 rounded-3xl bg-white border-2 border-transparent shadow-sm focus:border-btn-blue focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 font-bold md:text-lg placeholder-gray-400"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-btn-blue transition-colors" />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-btn-blue text-white px-5 py-2 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              Buscar
            </button>
          </form>

          {query && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-gray-600 font-medium">
                {loading ? "Buscando..." : (
                  <>
                    Resultados para <span className="text-gray-900 font-black">"{query}"</span> 
                    <span className="ml-2 text-gray-400 text-sm">({products.length} productos)</span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-btn-blue animate-spin" />
                <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl -z-10" />
              </div>
              <p className="mt-4 text-gray-500 font-bold animate-pulse">Buscando los mejores tesoros...</p>
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-200" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">No encontramos nada</h2>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                Parece que no tenemos productos que coincidan con "<span className="text-gray-800">{query}</span>" en este momento.
              </p>
              <button 
                onClick={() => { setInputValue(""); window.history.pushState(null, "", "/search"); fetchSearchResults(""); }}
                className="bg-gray-100 text-gray-600 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                Ver todos los productos
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-btn-blue" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
