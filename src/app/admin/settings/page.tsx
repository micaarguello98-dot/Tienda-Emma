"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Settings, Save, Loader2, Info, Phone, Truck, Megaphone } from "lucide-react";

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({
    hero_title: "",
    hero_subtitle: "",
    about_story: "",
    clients_intro: "",
    whatsapp_phone: "",
    shipping_base: "",
    shipping_percent: "",
    shipping_info: "",
    shipping_delivery_hint: "",
    promo_banner_enabled: "",
    promo_banner_text: "",
    promo_banner_link: "",
    promo_banner_color: "from-pink-500 to-rose-500",
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    const { data, error } = await supabase.from('site_config').select('*');
    if (data) {
      const configMap: Record<string, string> = { ...config };
      data.forEach((item: any) => {
        configMap[item.key] = item.value;
      });
      setConfig(configMap);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        key,
        value
      }));

      const { error } = await supabase.from('site_config').upsert(updates);
      if (error) throw error;
      alert("¡Configuración guardada!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-btn-blue text-white rounded-xl md:rounded-2xl flex items-center justify-center p-2 shadow-lg shadow-blue-200">
               <Settings className="w-5 h-5 md:w-6 md:h-6 stroke-[3px]" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Personalización</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Configura tu Tienda</p>
            </div>
         </div>
      </header>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 p-6 md:p-8 space-y-8 max-w-2xl">
         <div className="bg-blue-50/50 p-4 rounded-3xl flex gap-4 items-start border border-blue-100/50">
            <Info className="w-6 h-6 text-btn-blue shrink-0 mt-1" />
            <p className="text-xs text-blue-600 font-medium leading-relaxed">
              Aquí puedes cambiar los textos principales de la tienda sin entrar al código. 
              Estos cambios se reflejarán inmediatamente en la página principal para todos los usuarios.
            </p>
         </div>

         {/* Banner Promocional */}
         <div className="rounded-[1.75rem] border-2 border-pink-100 bg-gradient-to-br from-pink-50/80 to-white p-6 space-y-5">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-100">
               <Megaphone className="w-5 h-5 stroke-[2.5px]" />
             </div>
             <div>
               <h2 className="text-sm font-black text-gray-900 tracking-tight">Banner Promocional</h2>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                 Se muestra arriba de la tienda
               </p>
             </div>
           </div>

           <label className="flex items-center gap-3 cursor-pointer">
             <input
               type="checkbox"
               checked={config.promo_banner_enabled === "true" || config.promo_banner_enabled === "1"}
               onChange={(e) =>
                 setConfig({ ...config, promo_banner_enabled: e.target.checked ? "true" : "false" })
               }
               className="h-5 w-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
             />
             <span className="text-sm font-bold text-gray-800">Activar banner</span>
           </label>

           <div className="space-y-2">
             <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">
               Texto del banner
             </label>
             <input
               type="text"
               value={config.promo_banner_text ?? ""}
               onChange={(e) => setConfig({ ...config, promo_banner_text: e.target.value })}
               className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-pink-300"
               placeholder="Ej. ¡Envío gratis en compras mayores a $5000!"
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">
               Link (opcional, al hacer clic)
             </label>
             <input
               type="text"
               value={config.promo_banner_link ?? ""}
               onChange={(e) => setConfig({ ...config, promo_banner_link: e.target.value })}
               className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-pink-300"
               placeholder="Ej. /categories o https://..."
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">
               Color del degradado
             </label>
             <select
               value={config.promo_banner_color ?? "from-pink-500 to-rose-500"}
               onChange={(e) => setConfig({ ...config, promo_banner_color: e.target.value })}
               className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-pink-300 cursor-pointer"
             >
               <option value="from-pink-500 to-rose-500">🩷 Rosa</option>
               <option value="from-btn-blue to-blue-600">💙 Azul</option>
               <option value="from-green-500 to-emerald-600">💚 Verde</option>
               <option value="from-amber-500 to-orange-500">🧡 Naranja</option>
               <option value="from-purple-500 to-violet-600">💜 Violeta</option>
               <option value="from-gray-800 to-gray-900">🖤 Negro</option>
             </select>
           </div>
         </div>

         <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">Título del Hero (Inicio):</label>
              <textarea 
                rows={2}
                value={config.hero_title}
                onChange={(e) => setConfig({...config, hero_title: e.target.value})}
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">Subtítulo del Hero:</label>
              <textarea 
                rows={2}
                value={config.hero_subtitle}
                onChange={(e) => setConfig({...config, hero_subtitle: e.target.value})}
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                WhatsApp del vendedor (pedidos y botón flotante):
              </label>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={config.whatsapp_phone ?? ""}
                onChange={(e) =>
                  setConfig({ ...config, whatsapp_phone: e.target.value })
                }
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all font-sans"
                placeholder="Ej. 5215512345678 (código de país + número, solo dígitos)"
              />
              <p className="text-[10px] text-gray-400 px-1">
                Sin espacios ni símbolos. México: 52 + 10 dígitos. Los clientes enviarán el pedido por WhatsApp a este número.
              </p>
            </div>

            <div className="rounded-[1.75rem] border-2 border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-btn-blue text-white flex items-center justify-center shadow-md shadow-blue-100">
                  <Truck className="w-5 h-5 stroke-[2.5px]" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900 tracking-tight">Envíos</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    Costo estimado + texto para el carrito
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">
                    Monto base de envío ($)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={config.shipping_base ?? ""}
                    onChange={(e) =>
                      setConfig({ ...config, shipping_base: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">
                    % sobre el subtotal del pedido
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={config.shipping_percent ?? ""}
                    onChange={(e) =>
                      setConfig({ ...config, shipping_percent: e.target.value })
                    }
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30"
                    placeholder="Ej. 5"
                  />
                  <p className="text-[10px] text-gray-400 px-1">
                    El envío estimado = base + (subtotal × % ÷ 100). Solo vos lo definís aquí; el cliente lo ve en el carrito.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">
                  Explicación para clientes (Argentina — paqueterías, plazos)
                </label>
                <textarea
                  rows={6}
                  value={config.shipping_info ?? ""}
                  onChange={(e) =>
                    setConfig({ ...config, shipping_info: e.target.value })
                  }
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-btn-blue/30 leading-relaxed"
                  placeholder="Ej. Trabajamos con envíos por Andreani, OCA o Correo Argentino según zona. Los costos varían por peso y destino; el monto del carrito es orientativo y se confirma por WhatsApp…"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">
                  Línea corta bajo el resumen (opcional)
                </label>
                <input
                  type="text"
                  value={config.shipping_delivery_hint ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      shipping_delivery_hint: e.target.value,
                    })
                  }
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30"
                  placeholder="Ej. Plazos orientativos 3–7 días hábiles según correo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-1">
                Texto sección Mis clientes (inicio):
              </label>
              <textarea 
                rows={4}
                value={config.clients_intro || config.about_story}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    clients_intro: e.target.value,
                    about_story: e.target.value,
                  })
                }
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all font-sans"
                placeholder="Ej. Gracias a las familias que eligen Mundo Emma..."
              />
              <p className="text-[10px] text-gray-400 px-1">
                Se muestra junto a la galería de fotos que subes en <b>Mis clientes</b>.
              </p>
            </div>
         </div>

         <button 
           onClick={handleSave}
           disabled={saving}
           className="w-full bg-btn-blue text-white font-black uppercase tracking-widest py-4 rounded-3xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-70"
         >
           {saving ? <Loader2 className="animate-spin w-5 h-5" /> : (
             <>
               <Save className="w-5 h-5" />
               GUARDAR CONFIGURACIÓN
             </>
           )}
         </button>
      </div>
    </div>
  );
}
