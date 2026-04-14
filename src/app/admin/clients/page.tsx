"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Images, Upload, Loader2, Trash2, GripVertical } from "lucide-react";

type Row = { id: string; url: string; sort_order: number };

export default function AdminClientsPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_photos")
      .select("id, url, sort_order")
      .order("sort_order", { ascending: true });
    if (!error && data) setRows(data as Row[]);
    else setRows([]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "/admin/login";
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      // Mismo patrón que productos: archivo en la raíz del bucket (evita reglas de Storage por carpeta).
      const path = `client-${Date.now()}-${Math.random().toString(36).slice(2, 12)}.${ext}`;

      const { error: upErr } = await supabase.storage.from("tienda-emma").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
      });

      if (upErr) {
        throw new Error(
          `[Storage] ${upErr.message}. Si el bucket es privado, revisa en Supabase → Storage → Policies que el rol authenticated pueda INSERT en el bucket tienda-emma.`
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("tienda-emma").getPublicUrl(path);

      const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
      const { error: insErr } = await supabase.from("client_photos").insert({
        url: publicUrl,
        sort_order: nextOrder,
      });

      if (insErr) {
        throw new Error(
          `[Base de datos] ${insErr.message}. Ejecuta el SQL de client_photos y revisa RLS (usuario autenticado debe poder INSERT).`
        );
      }

      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Quitar esta foto de la galería?")) return;
    const { error } = await supabase.from("client_photos").delete().eq("id", id);
    if (error) alert(error.message);
    else load();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-btn-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Images className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Mis clientes</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Fotos en la sección de inicio
          </p>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm max-w-3xl">
        <p className="text-sm text-gray-600 mb-6">
          Las imágenes aparecen en la sección <b>MIS CLIENTES</b> del inicio. El texto de esa sección lo editas en{" "}
          <b>Configuración</b> (campo texto Mis clientes).
        </p>

        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-blue-200 rounded-3xl p-10 cursor-pointer hover:bg-blue-50/40 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) upload(f);
            }}
          />
          {uploading ? (
            <Loader2 className="w-10 h-10 animate-spin text-btn-blue" />
          ) : (
            <Upload className="w-10 h-10 text-btn-blue" />
          )}
          <span className="text-sm font-black text-gray-700 uppercase tracking-wide">
            Subir foto de cliente
          </span>
        </label>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-btn-blue" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No hay fotos aún.</p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {rows.map((r) => (
              <li
                key={r.id}
                className="relative group rounded-2xl overflow-hidden border border-gray-100 aspect-square bg-gray-50"
              >
                <Image src={r.url} alt="" fill className="object-cover" sizes="200px" />
                <div className="absolute top-2 left-2 p-1 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="absolute bottom-2 right-2 p-2 rounded-xl bg-red-500 text-white shadow-lg opacity-90 hover:opacity-100"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
