"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  ShoppingBag,
  Loader2,
  Search,
  Clock,
  CheckCircle,
  Ban,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "completado", label: "Completado" },
  { value: "cancelado", label: "Cancelado" },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  pendiente: <Clock className="w-4 h-4 text-amber-500" />,
  completado: <CheckCircle className="w-4 h-4 text-green-500" />,
  cancelado: <Ban className="w-4 h-4 text-gray-400" />,
};

function normalizeStatus(s: string) {
  if (s === "pendiente_confirmacion" || s === "confirmado" || s === "en_preparacion" || s === "enviado") return "pendiente";
  if (s === "entregado") return "completado";
  return s;
}

function statusLabel(s: string) {
  return STATUS_OPTIONS.find(o => o.value === s)?.label ?? s;
}

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const email = String(o.customer_email || "").toLowerCase();
    const phone = String(o.customer_phone || "").toLowerCase();
    const name = String(o.customer_name || "").toLowerCase();
    const id = String(o.id || "");
    return email.includes(q) || phone.includes(q) || name.includes(q) || id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-btn-blue text-white rounded-xl md:rounded-2xl flex items-center justify-center p-2 shadow-lg shadow-blue-200">
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 stroke-[3px]" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
              Gestión de Pedidos
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
              Marcá como completado o cancelado
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo…"
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-btn-blue transition-all w-full sm:w-72"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <p className="text-xs text-gray-500 font-medium max-w-2xl">
        Cada pedido se crea cuando el cliente toca &quot;Enviar por WhatsApp&quot;. Cambiá el estado
        según cómo se concrete la venta. Al marcarlo como <b>Completado</b>, el cliente lo verá así en &quot;Mis Pedidos&quot;.
      </p>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-btn-blue w-10 h-10" />
            <p className="text-sm font-bold text-gray-400">CARGANDO PEDIDOS...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center px-6">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay pedidos registrados aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedido</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Productos</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const st = normalizeStatus(String(order.status || "pendiente"));
                  const lineItems = (order.line_items || []) as any[];

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <span className="text-[10px] font-mono font-bold text-gray-400 block">
                          #{String(order.id).slice(0, 8)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleString("es-AR")
                            : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-bold text-gray-900">
                          {order.customer_name || "—"}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {order.customer_phone || ""}
                        </p>
                        {order.customer_email && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {order.customer_email}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-1 max-w-[200px]">
                          {lineItems.slice(0, 3).map((item: any, idx: number) => (
                            <p key={idx} className="text-[11px] text-gray-600 truncate">
                              {item.quantity}× {item.name}
                            </p>
                          ))}
                          {lineItems.length > 3 && (
                            <p className="text-[10px] text-gray-400 font-bold">
                              +{lineItems.length - 3} más
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="text-sm font-black text-gray-900">
                          ${Number(order.total).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full w-fit">
                          {STATUS_ICON[st] || STATUS_ICON["pendiente"]}
                          <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider">
                            {statusLabel(st)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right align-top">
                        <select
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          value={st}
                          className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-btn-blue cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
