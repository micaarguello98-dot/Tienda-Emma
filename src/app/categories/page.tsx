"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProductGrid } from "@/components/home/ProductGrid";
import { CategoryCapsules } from "@/components/home/CategoryCapsules";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";

export default function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(activeCategory === cat ? null : cat);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <Header />

      <main className="pt-24">
        <div className="max-w-screen-xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-6 h-6 text-btn-blue" />
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {activeCategory || "Todos los productos"}
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-4">
            {activeCategory 
              ? "Tocá otra categoría para cambiar o volvé a tocar para ver todos." 
              : "Explorá nuestro catálogo completo. Filtrá por categoría abajo."}
          </p>
        </div>

        <CategoryCapsules 
          activeCategory={activeCategory} 
          onSelectCategory={handleSelectCategory} 
        />

        <ProductGrid activeCategory={activeCategory} />
      </main>

      <BottomNav />
    </div>
  );
}
