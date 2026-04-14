"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { createClient } from "@/utils/supabase/client";
import {
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Search,
  Clock,
  CheckCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";

interface OrderLineItem {
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pendiente: {
    label: "Pendiente",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-4 h-4" />,
  },
  completado: {
    label: "Completado",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: <Package className="w-4 h-4" />,
  },
};

function getStatusInfo(status: string) {
  // Normalize legacy statuses
  const normalized = status === "pendiente_confirmacion" ? "pendiente" 
    : status === "confirmado" || status === "en_preparacion" || status === "enviado" ? "pendiente"
    : status;
  return STATUS_CONFIG[normalized] || STATUS_CONFIG["pendiente"];
}

export default function OrdersPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = phone.trim();
    if (p.length < 6) return;

    setLoading(true);
    setHasSearched(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_phone", p)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <Header />

      <main className="max-w-screen-md mx-auto pt-28 md:pt-32 px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">
            Mis <span className="text-btn-blue">pedidos</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-2">
            Ingresá tu número de teléfono para ver el estado de tus pedidos.
          </p>
        </div>

        {/* Search by phone */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-btn-blue" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Buscar con tu teléfono
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Tu número de teléfono"
                className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30"
              />
              <button
                type="submit"
                disabled={loading || phone.trim().length < 6}
                className="bg-btn-blue text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-btn-blue" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Buscando pedidos…
            </p>
          </div>
        ) : hasSearched && orders.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 md:p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-btn-blue" />
            </div>
            <p className="text-gray-600 font-medium text-sm leading-relaxed mb-8">
              No encontramos pedidos con ese teléfono. Asegurate de usar el mismo número con el que hiciste tu pedido.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-btn-blue text-white font-black uppercase tracking-widest text-xs py-4 px-8 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
            >
              Ir a la tienda
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const open = expanded === order.id;
              const lines = (order.line_items || []) as OrderLineItem[];
              const statusInfo = getStatusInfo(order.status || "pendiente");

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : order.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-mono font-bold text-gray-400 mb-1">
                        #{order.id.slice(0, 8)}
                      </p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium mt-2">
                        {new Date(order.created_at).toLocaleString("es-AR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-black text-btn-blue">
                        ${Number(order.total).toFixed(2)}
                      </span>
                      {open ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {open && (
                    <div className="px-5 md:px-6 pb-6 pt-0 border-t border-gray-50 space-y-4">
                      <div className="text-sm text-gray-600 space-y-1 pt-4">
                        <p>
                          <span className="font-black text-gray-800">Nombre:</span>{" "}
                          {order.customer_name}
                        </p>
                        <p>
                          <span className="font-black text-gray-800">Tel:</span>{" "}
                          {order.customer_phone}
                        </p>
                        {order.customer_email && (
                          <p>
                            <span className="font-black text-gray-800">Correo:</span>{" "}
                            {order.customer_email}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                          Productos
                        </p>
                        <ul className="space-y-2">
                          {lines.map((row, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between text-sm text-gray-700 gap-2"
                            >
                              <span className="font-medium truncate">
                                {row.quantity}× {row.name}
                              </span>
                              <span className="font-bold text-gray-900 shrink-0">
                                ${row.line_total.toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
