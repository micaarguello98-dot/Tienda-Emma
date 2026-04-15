"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CAPSULE_COLORS = [
  "bg-blue-100/50 text-blue-600",
  "bg-pink-100/50 text-pink-600",
  "bg-green-100/50 text-green-600",
  "bg-yellow-100/50 text-yellow-600",
  "bg-purple-100/50 text-purple-600",
  "bg-red-100/50 text-red-600",
  "bg-teal-100/50 text-teal-600",
  "bg-orange-100/50 text-orange-600",
];

interface CategoryCapsulesProps {
  activeCategory?: string | null;
  onSelectCategory?: (category: string) => void;
}

export const CategoryCapsules = ({ activeCategory, onSelectCategory }: CategoryCapsulesProps) => {
  const [categories, setCategories] = useState<{ id: string; name: string; range: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("id, name, range")
      .order("sort_order", { ascending: true })
      .then(({ data }: { data: any }) => {
        if (data) setCategories(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-6 md:py-8 px-6 md:justify-around">
      {categories.map((cat, idx) => (
        <motion.div 
          key={cat.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 * idx }}
          onClick={() => onSelectCategory?.(cat.name.toUpperCase())}
          className="flex flex-col items-center gap-2 group min-w-[85px] md:min-w-[100px] cursor-pointer flex-shrink-0"
        >
          <div className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all group-hover:scale-105 shadow-sm border-4",
            activeCategory === cat.name.toUpperCase() ? "border-btn-blue scale-105" : "border-white/50",
            CAPSULE_COLORS[idx % CAPSULE_COLORS.length]
          )}>
            <Tag className="w-8 h-8 md:w-10 md:h-10 stroke-[1.5px]" />
          </div>
          <div className="text-center">
             <span className="block text-[11px] md:text-xs font-bold text-gray-800">{cat.name.toUpperCase()}</span>
             {cat.range && <span className="block text-[9px] md:text-[10px] text-gray-500">({cat.range})</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
