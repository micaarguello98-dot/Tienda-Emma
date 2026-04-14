"use client";

import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  Trash2,
  ShoppingBag,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();

  // Seller WhatsApp from site_config
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerLoading, setSellerLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "whatsapp_phone")
        .maybeSingle();
      setSellerPhone((data?.value as string)?.replace(/\D/g, "") ?? "");
      setSellerLoading(false);
    })();
  }, []);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSendWhatsApp = async () => {
    setFormError(null);

    const n = name.trim();
    const p = phone.trim();

    if (n.length < 2) {
      setFormError("Indicá tu nombre completo.");
      return;
    }
    if (p.length < 8) {
      setFormError("Indicá un teléfono válido.");
      return;
    }
    if (sellerPhone.length < 8) {
      setFormError("El vendedor aún no configuró su WhatsApp. Avisale o intentá más tarde.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      // Build line items for DB
      const lineItems = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
        image: item.image,
        category: item.category,
      }));

      // 1. Save order to Supabase as "pendiente"
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: n,
          customer_phone: p,
          customer_email: email.trim() || null,
          line_items: lineItems,
          subtotal,
          total: subtotal,
          status: "pendiente",
        });

      if (orderError) {
        console.error("Order error:", orderError);
        setFormError("No se pudo guardar el pedido: " + orderError.message);
        return;
      }

      // 2. Build WhatsApp message
      const productLines = items.map(
        (i) => `• ${i.quantity}x ${i.name} — $${i.price.toFixed(2)} c/u → $${(i.price * i.quantity).toFixed(2)}`
      );

      const message = [
        "¡Hola! Quiero hacer un pedido en *Mundo Emma*:",
        "",
        "*Productos:*",
        ...productLines,
        "",
        `*Total:* $${subtotal.toFixed(2)}`,
        "",
        "*Datos del cliente:*",
        `Nombre: ${n}`,
        `Teléfono: ${p}`,
        email.trim() ? `Correo: ${email.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      // 3. Open WhatsApp
      const waUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      // 4. Clear cart
      clearCart();

    } catch (err: any) {
      setFormError("Error inesperado: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header />

      <main className="max-w-3xl mx-auto pt-24 px-6">
        <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-btn-blue" />
          TU CARRITO
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-6">Tu carrito está vacío.</p>
            <Link
              href="/"
              className="inline-block bg-btn-blue text-white px-8 py-3 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all"
            >
              Comenzar a comprar
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product list */}
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 flex gap-4 items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center p-3 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-btn-blue uppercase font-black tracking-widest mb-0.5 opacity-60">
                          {item.category}
                        </p>
                        <h3 className="font-black text-gray-900 text-sm md:text-base leading-tight truncate">
                          {item.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-gray-900">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2.5 py-1 rounded-lg">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-btn-blue text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Form */}
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-[2.5rem] p-7 md:p-8 shadow-sm border border-gray-100 lg:sticky lg:top-28">
                <h2 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">
                  Resumen
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm items-baseline">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      Subtotal
                    </span>
                    <span className="font-bold text-gray-700">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between items-end">
                    <span className="text-gray-900 font-black uppercase tracking-widest text-xs">
                      Total
                    </span>
                    <span className="text-3xl font-black text-btn-blue leading-none">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer data form */}
                <div className="space-y-3 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                    Tus datos para el pedido
                  </p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre y apellido *"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30"
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Tu teléfono *"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico (opcional)"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30"
                  />
                </div>

                {formError && (
                  <p className="text-xs font-bold text-red-500 mb-3 px-1">{formError}</p>
                )}

                {!sellerLoading && sellerPhone.length < 8 && (
                  <p className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
                    Falta configurar el WhatsApp del vendedor en Panel Admin → Configuración.
                  </p>
                )}

                <button
                  type="button"
                  disabled={submitting || sellerLoading || sellerPhone.length < 8}
                  onClick={handleSendWhatsApp}
                  className="w-full bg-[#25D366] text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting || sellerLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                  Enviar Pedido por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
