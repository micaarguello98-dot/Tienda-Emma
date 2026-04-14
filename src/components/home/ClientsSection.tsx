"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Loader2 } from "lucide-react";

type ClientPhoto = { id: string; url: string; sort_order: number };

export const ClientsSection = () => {
  const [intro, setIntro] = useState("");
  const [photos, setPhotos] = useState<ClientPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const [{ data: cfg }, { data: imgs, error: imgErr }] = await Promise.all([
          supabase.from("site_config").select("key, value"),
          supabase.from("client_photos").select("id, url, sort_order").order("sort_order", { ascending: true }),
        ]);

        const map = Object.fromEntries((cfg || []).map((r: { key: string; value: string }) => [r.key, r.value]));
        const text =
          (map.clients_intro as string)?.trim() ||
          (map.about_story as string)?.trim() ||
          "";
        setIntro(text);

        if (!imgErr && imgs) setPhotos(imgs as ClientPhoto[]);
        else setPhotos([]);
      } catch {
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  return (
    <section id="clients" className="w-full cloud-bg px-6 py-12 md:py-24">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-10 md:gap-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 text-center md:text-left">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full mx-auto md:mx-0">
              <Users className="w-4 h-4 text-btn-blue" />
              <span className="text-[10px] font-black text-btn-blue uppercase tracking-widest">Comunidad</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight uppercase leading-[0.95]">
              MIS <span className="text-btn-blue">CLIENTES</span>
            </h2>

            {loading ? (
              <div className="space-y-2 max-w-xl mx-auto md:mx-0">
                <div className="h-4 bg-gray-200 animate-pulse rounded-full w-full" />
                <div className="h-4 bg-gray-200 animate-pulse rounded-full w-2/3 mx-auto md:mx-0" />
              </div>
            ) : (
              <p className="text-base md:text-lg text-gray-600 leading-relaxed font-medium max-w-xl mx-auto md:mx-0">
                {intro ||
                  "Las familias que confían en Mundo Emma. Pronto podrás ver sus fotos aquí desde el panel de administración."}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-btn-blue" />
          </div>
        ) : photos.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 list-none p-0 m-0"
          >
            {photos.map((ph, i) => (
              <li
                key={ph.id}
                className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-white/60 shadow-lg shadow-blue-100/40 bg-white"
              >
                <Image
                  src={ph.url}
                  alt={`Cliente ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </li>
            ))}
          </motion.ul>
        ) : (
          <div className="rounded-[2rem] border-2 border-dashed border-blue-200/80 bg-white/60 py-16 px-6 text-center">
            <p className="text-sm font-bold text-gray-500">
              Aún no hay fotos de clientes. Súbelas desde el panel: <span className="text-btn-blue">Mis clientes</span>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
