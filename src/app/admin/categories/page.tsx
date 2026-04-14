"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tags, Plus, Trash2, Loader2, Save, GripVertical } from "lucide-react";

interface Category {
  id: string;
  name: string;
  range: string | null;
  sort_order: number;
}

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New category form
  const [newName, setNewName] = useState("");
  const [newRange, setNewRange] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  const handleAddCategory = async () => {
    const name = newName.trim();
    if (!name) {
      alert("Escribí un nombre para la categoría.");
      return;
    }

    setSaving(true);
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order || 0)) + 1 : 0;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name, range: newRange.trim() || null, sort_order: maxOrder })
      .select()
      .single();

    if (error) {
      alert("Error al crear: " + error.message);
    } else if (data) {
      setCategories([...categories, data]);
      setNewName("");
      setNewRange("");
    }
    setSaving(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar esta categoría? Los productos asociados quedarán sin categoría.")) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleUpdateCategory = async (id: string, field: string, value: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const cat of categories) {
        await supabase
          .from("categories")
          .update({ name: cat.name, range: cat.range, sort_order: cat.sort_order })
          .eq("id", cat.id);
      }
      alert("¡Categorías guardadas!");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
    setSaving(false);
  };

  const moveCategory = (idx: number, direction: "up" | "down") => {
    const newCats = [...categories];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newCats.length) return;

    // Swap sort_order
    const tempOrder = newCats[idx].sort_order;
    newCats[idx].sort_order = newCats[swapIdx].sort_order;
    newCats[swapIdx].sort_order = tempOrder;

    // Swap position in array
    [newCats[idx], newCats[swapIdx]] = [newCats[swapIdx], newCats[idx]];
    setCategories(newCats);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 animate-pulse">
        <Loader2 className="animate-spin text-btn-blue w-10 h-10" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">CARGANDO...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-btn-blue text-white rounded-xl md:rounded-2xl flex items-center justify-center p-2 shadow-lg shadow-blue-200">
          <Tags className="w-5 h-5 md:w-6 md:h-6 stroke-[3px]" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Categorías del Menú</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
            Editá el menú de la tienda
          </p>
        </div>
      </header>

      <p className="text-xs text-gray-500 font-medium max-w-2xl">
        Estas categorías aparecerán en el <b>menú de navegación</b> y en las <b>cápsulas de categoría</b> de la tienda. 
        Podés cambiar el nombre, el rango de edad y el orden. Los cambios se aplican de inmediato.
      </p>

      {/* Existing categories */}
      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 group hover:shadow-md transition-shadow">
            {/* Reorder */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveCategory(idx, "up")}
                disabled={idx === 0}
                className="text-gray-300 hover:text-btn-blue disabled:opacity-30 transition-colors p-0.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 15L12 9L6 15" /></svg>
              </button>
              <button
                onClick={() => moveCategory(idx, "down")}
                disabled={idx === categories.length - 1}
                className="text-gray-300 hover:text-btn-blue disabled:opacity-30 transition-colors p-0.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 9L12 15L18 9" /></svg>
              </button>
            </div>

            <GripVertical className="w-4 h-4 text-gray-200 shrink-0" />

            {/* Name */}
            <input
              type="text"
              value={cat.name}
              onChange={(e) => handleUpdateCategory(cat.id, "name", e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 min-w-0"
              placeholder="Nombre"
            />

            {/* Range */}
            <input
              type="text"
              value={cat.range || ""}
              onChange={(e) => handleUpdateCategory(cat.id, "range", e.target.value)}
              className="w-28 md:w-36 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:border-btn-blue/30 shrink-0"
              placeholder="Ej. 0-24m"
            />

            {/* Delete */}
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new category */}
      <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-btn-blue">+ Nueva categoría</p>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre (ej. Bebés)"
            className="flex-1 min-w-[150px] bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30"
          />
          <input
            type="text"
            value={newRange}
            onChange={(e) => setNewRange(e.target.value)}
            placeholder="Rango (ej. 0-24m)"
            className="w-32 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 focus:outline-none focus:border-btn-blue/30"
          />
          <button
            onClick={handleAddCategory}
            disabled={saving}
            className="bg-btn-blue text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Save all changes */}
      <button
        onClick={handleSaveAll}
        disabled={saving}
        className="w-full bg-btn-blue text-white font-black uppercase tracking-widest py-4 rounded-3xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-70"
      >
        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : (
          <>
            <Save className="w-5 h-5" />
            GUARDAR CAMBIOS
          </>
        )}
      </button>
    </div>
  );
}
