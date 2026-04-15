"use client";

import { Upload, Plus, Loader2, X, Image as ImageIcon, Pencil, Trash2, Package, Star } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

type CategoryRow = { id: string; name: string; slug: string };

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number | null;
  description: string | null;
  category_id: string;
  is_featured?: boolean | null;
  categories: { name: string; slug: string } | null;
  product_images: { url: string; is_primary: boolean | null }[] | null;
};

function normalizeProductRow(raw: unknown): ProductRow {
  const r = raw as Record<string, unknown>;
  const cat = r.categories;
  const categoryObj = Array.isArray(cat) ? (cat[0] as ProductRow["categories"]) : (cat as ProductRow["categories"]);
  return {
    id: r.id as string,
    name: r.name as string,
    price: Number(r.price),
    stock: r.stock as number | null,
    description: (r.description as string | null) ?? null,
    category_id: r.category_id as string,
    is_featured: Boolean(r.is_featured),
    categories: categoryObj ?? null,
    product_images: (r.product_images as ProductRow["product_images"]) ?? null,
  };
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminProductsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [productsList, setProductsList] = useState<ProductRow[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; is_primary: boolean }[]>([]);

  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from("categories").select("id, name, slug").order("name");
    if (data) setCategories(data as CategoryRow[]);
  }, [supabase]);

  const loadProducts = useCallback(async () => {
    setListLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          price,
          stock,
          description,
          is_featured,
          category_id,
          categories ( name, slug ),
          product_images ( url, is_primary )
        `
        )
        .order("id", { ascending: false });

      if (error) throw error;
      setProductsList((data || []).map((row: any) => normalizeProductRow(row)));
    } catch (e) {
      console.error(e);
      setProductsList([]);
    } finally {
      setListLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setStock("");
    setCategoryId("");
    setDescription("");
    setIsFeatured(false);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setExistingImages([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
    e.target.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    // Revocamos el objeto para liberar memoria
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const startEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setStock(String(p.stock ?? ""));
    setCategoryId(p.category_id);
    setDescription(p.description || "");
    setIsFeatured(Boolean(p.is_featured));
    setSelectedFiles([]);
    setPreviewUrls([]);
    
    // Mapeamos para asegurar que is_primary no sea null (TypeScript error fix)
    const images = (p.product_images || []).map(img => ({
      url: img.url,
      is_primary: !!img.is_primary
    }));
    
    setExistingImages(images);
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("tienda-emma").upload(fileName, file);
    if (uploadError) throw uploadError;
    const {
      data: { publicUrl },
    } = supabase.storage.from("tienda-emma").getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSaveProduct = async () => {
    if (!name || !price || !categoryId) {
      alert("Completa nombre, precio y categoría.");
      return;
    }
    if (!editingId && selectedFiles.length === 0) {
      alert("Selecciona al menos una imagen para el producto nuevo.");
      return;
    }

    setLoading(true);
    try {
      let productId = editingId;

      if (editingId) {
        const { error: uErr } = await supabase
          .from("products")
          .update({
            name,
            price: parseFloat(price),
            stock: parseInt(stock, 10) || 0,
            category_id: categoryId,
            description,
            is_featured: isFeatured,
          })
          .eq("id", editingId);
        if (uErr) throw uErr;

        // Limpiar imagenes viejas y poner las que quedaron + las nuevas
        await supabase.from("product_images").delete().eq("product_id", editingId);
      } else {
        const { data: product, error: pError } = await supabase
          .from("products")
          .insert([
            {
              name,
              price: parseFloat(price),
              stock: parseInt(stock, 10) || 0,
              category_id: categoryId,
              description,
              is_featured: isFeatured,
            },
          ])
          .select()
          .single();

        if (pError) throw pError;
        productId = product.id;
      }

      // Re-insertar imagenes existentes que NO fueron borradas
      if (existingImages.length > 0) {
        const toInsert = existingImages.map((img, idx) => ({
          product_id: productId,
          url: img.url,
          is_primary: idx === 0,
        }));
        await supabase.from("product_images").insert(toInsert);
      }

      // Subir y insertar imagenes nuevas
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const publicUrl = await uploadImage(selectedFiles[i]);
          await supabase.from("product_images").insert({
            product_id: productId,
            url: publicUrl,
            is_primary: existingImages.length === 0 && i === 0,
          });
        }
      }

      alert(editingId ? "Producto actualizado." : "Producto publicado.");
      resetForm();
      await loadProducts();
    } catch (error: unknown) {
      console.error("Error saving product:", error);
      alert("Error: " + (error instanceof Error ? error.message : "desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    try {
      await supabase.from("product_images").delete().eq("product_id", id);
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      if (editingId === id) resetForm();
      await loadProducts();
    } catch (error: unknown) {
      console.error(error);
      alert("No se pudo eliminar (revisa permisos RLS en Supabase).");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const nameTrim = newCatName.trim();
    if (!nameTrim) {
      alert("Escribe el nombre de la categoría.");
      return;
    }
    const slug = newCatSlug.trim() ? slugify(newCatSlug) : slugify(nameTrim);
    if (!slug) {
      alert("Slug inválido.");
      return;
    }

    setCatSaving(true);
    try {
      const { error } = await supabase.from("categories").insert({ name: nameTrim, slug });
      if (error) throw error;
      setNewCatName("");
      setNewCatSlug("");
      await loadCategories();
    } catch (e: unknown) {
      alert("Error al crear categoría: " + (e instanceof Error ? e.message : ""));
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, slug: string) => {
    const using = productsList.filter((p) => p.category_id === id).length;
    if (using > 0) {
      alert(`No puedes borrar esta categoría: hay ${using} producto(s) asignados.`);
      return;
    }
    if (!confirm(`¿Eliminar la categoría "${slug}"?`)) return;
    setCatSaving(true);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      await loadCategories();
    } catch (e: unknown) {
      alert("Error al borrar: " + (e instanceof Error ? e.message : ""));
    } finally {
      setCatSaving(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-btn-blue text-white rounded-xl md:rounded-2xl flex items-center justify-center p-2 shadow-lg shadow-blue-200">
            <Package className="w-5 h-5 md:w-6 md:h-6 stroke-[3px]" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Productos y categorías</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">
              Listar, editar, borrar y nuevas categorías
            </p>
          </div>
        </div>
      </header>

      {/* Lista de productos */}
      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Productos en tienda</h2>
          {listLoading && <Loader2 className="w-5 h-5 animate-spin text-btn-blue" />}
        </div>
        <div className="divide-y divide-gray-50 max-h-[min(420px,55vh)] overflow-y-auto">
          {productsList.length === 0 && !listLoading ? (
            <p className="p-6 text-sm text-gray-500 text-center">No hay productos aún.</p>
          ) : (
            productsList.map((p) => {
              const thumb =
                p.product_images?.find((i) => i.is_primary)?.url ||
                p.product_images?.[0]?.url ||
                "/logo.png";
              const catName = p.categories?.name ?? "—";
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50/80 transition-colors"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <Image src={thumb} alt="" fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-sm flex items-center gap-1.5">
                      {p.is_featured && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" aria-hidden />
                      )}
                      <span className="truncate">{p.name}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {catName} · ${Number(p.price).toFixed(2)}
                      {p.is_featured ? " · Inicio" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="p-2.5 rounded-xl text-btn-blue hover:bg-blue-50 transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      disabled={loading}
                      className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Categorías</h2>
        <p className="text-xs text-gray-500">
          Los <b>slugs</b> deben coincidir con los filtros de la tienda (ej. <code className="bg-gray-100 px-1 rounded">bebes</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">ninas</code>, <code className="bg-gray-100 px-1 rounded">ninos</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">accesorios</code>).
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nombre (ej. Bebés)"
            className="flex-1 bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold"
          />
          <input
            type="text"
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
            placeholder="slug-opcional"
            className="flex-1 sm:max-w-[200px] bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={catSaving}
            className="bg-gray-900 text-white font-black uppercase tracking-widest text-xs py-3 px-6 rounded-2xl hover:bg-gray-800 transition-colors shrink-0"
          >
            {catSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Añadir"}
          </button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-800"
            >
              <span>
                {c.name} <span className="text-gray-400 font-medium">({c.slug})</span>
              </span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(c.id, c.slug)}
                className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600"
                aria-label="Quitar categoría"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Formulario crear / editar */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-btn-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Plus className="w-5 h-5 stroke-[3px]" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900">
              {editingId ? "Editar producto" : "Nuevo producto"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-btn-blue hover:underline mt-0.5"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </div>

        <div
          className="bg-white rounded-[2.5rem] border-2 border-dashed border-blue-200 p-8 space-y-6 shadow-sm hover:bg-blue-50/10 transition-all"
        >
          <div className="flex flex-col items-center justify-center gap-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="w-16 h-16 bg-blue-50 text-btn-blue rounded-full flex items-center justify-center shadow-inner">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-gray-700 text-center">
              {editingId ? "Toca para añadir más imágenes" : "Haz clic para subir fotos del producto"}
            </p>
          </div>

          {(existingImages.length > 0 || selectedFiles.length > 0) && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {/* Existing Images */}
              {existingImages.map((img, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-btn-blue/80 text-[8px] text-white font-black text-center py-0.5 uppercase tracking-tighter">Principal</span>}
                </div>
              ))}
              
              {/* New Selected Files */}
              {previewUrls.map((url, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-blue-50 border border-blue-200 group">
                  <img 
                    src={url} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {existingImages.length === 0 && idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-btn-blue/80 text-[8px] text-white font-black text-center py-0.5 uppercase tracking-tighter">Principal</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 px-1">
              Nombre del producto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Conjunto Bebé Algodón"
              className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 px-1">Precio</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 px-1">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Cantidad"
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 px-1">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all appearance-none cursor-pointer"
            >
              <option value="">Seleccionar...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 px-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalles sobre el material, tallas, etc."
              className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3.5">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-btn-blue focus:ring-btn-blue"
            />
            <span>
              <span className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Producto destacado en el inicio
              </span>
              <span className="block text-[11px] text-gray-500 mt-1 leading-snug">
                Aparece en el carril horizontal &quot;Productos destacados&quot; debajo del banner principal.
              </span>
            </span>
          </label>

          <button
            type="button"
            onClick={handleSaveProduct}
            disabled={loading}
            className="w-full bg-btn-blue text-white font-black uppercase tracking-widest py-4 rounded-3xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                {editingId ? "Guardar cambios" : "Publicar con foto"}
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
