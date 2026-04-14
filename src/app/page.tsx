"use client";

import { useState, useRef } from "react";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Hero } from "@/components/home/Hero";
import { CategoryCapsules } from "@/components/home/CategoryCapsules";
import { FilterBar } from "@/components/home/FilterBar";
import { ProductGrid } from "@/components/home/ProductGrid";
import { ClientsSection } from "@/components/home/ClientsSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PromoBanner } from "@/components/home/PromoBanner";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [showAllMobile, setShowAllMobile] = useState<boolean>(false);
  const productsRef = useRef<HTMLElement>(null);

  const handleShowProducts = () => {
    setShowAllMobile(true);
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-white pb-28 overflow-x-hidden">
      <Header />
      <PromoBanner />
      
      <main className="max-w-screen-2xl mx-auto">
         <Hero activeCategory={activeCategory} onStoreClick={handleShowProducts} />
         
         <div className="relative -mt-6 bg-white rounded-t-[3rem] z-20">
            <CategoryCapsules 
              activeCategory={activeCategory} 
              onSelectCategory={(cat) => {
                const newCat = cat === activeCategory ? null : cat;
                setActiveCategory(newCat);
                if (!newCat) {
                  setShowAllMobile(false);
                } else {
                  setTimeout(() => {
                    productsRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }
              }} 
            />
            
            <div className={!activeCategory && !showAllMobile ? "hidden md:block" : "block"}>
              <div className="sticky top-14 bg-white z-40 transition-all">
                 <FilterBar sortBy={sortBy} onSortChange={setSortBy} />
              </div>

              <section ref={productsRef} className="py-2 scroll-mt-32">
                 <div className="px-6 mb-6">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                      COLECCIÓN <span className="text-btn-blue">PRODUCTOS</span>
                    </h2>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">
                      TEMPORADA 2026 - CALIDAD PREMIUM
                    </p>
                 </div>
                 
                 <ProductGrid activeCategory={activeCategory} sortBy={sortBy} />
              </section>
            </div>

            <ClientsSection />
         </div>
      </main>

      <BottomNav />
    </div>
  );
}
