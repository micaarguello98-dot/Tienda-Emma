"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2,
  Tags,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  totalCategories: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      // Fetch all orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch products count
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Fetch categories count
      const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      const allOrders = orders || [];
      const completed = allOrders.filter((o: any) => o.status === "completado");
      const pending = allOrders.filter((o: any) => o.status === "pendiente" || o.status === "pendiente_confirmacion");
      const totalRevenue = completed.reduce((sum, o: any) => sum + Number(o.total || 0), 0);

      setStats({
        totalRevenue,
        totalOrders: allOrders.length,
        pendingOrders: pending.length,
        completedOrders: completed.length,
        totalProducts: productCount || 0,
        totalCategories: categoryCount || 0,
        recentOrders: allOrders.slice(0, 5),
      });

      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-btn-blue w-10 h-10" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cargando dashboard...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          ¡Hola Barbara! 👋
        </h2>
        <p className="text-gray-500 font-medium mt-1">
          Aquí tenés un resumen de tu tienda Mundo Emma.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Ventas<br/>Totales</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-green-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Solo pedidos completados
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Pedidos<br/>Pendientes</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-btn-blue">{stats.pendingOrders}</p>
          <p className="text-[10px] text-amber-500 font-bold mt-1">Esperando tu confirmación</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-btn-blue group-hover:bg-btn-blue group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Productos<br/>Activos</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900">{stats.totalProducts}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">En el catálogo</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Ventas<br/>Completadas</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900">{stats.completedOrders}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">De {stats.totalOrders} pedidos totales</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="bg-gradient-to-br from-btn-blue to-blue-600 rounded-2xl p-6 text-white group hover:shadow-xl hover:shadow-blue-200 transition-all hover:scale-[1.02]"
        >
          <Package className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="font-black text-lg">Agregar Producto</h3>
          <p className="text-sm opacity-80 font-medium mt-1">Subí nuevos productos con fotos reales</p>
          <ArrowRight className="w-5 h-5 mt-4 opacity-60 group-hover:translate-x-2 transition-transform" />
        </Link>

        <Link
          href="/admin/orders"
          className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white group hover:shadow-xl hover:shadow-amber-200 transition-all hover:scale-[1.02]"
        >
          <ShoppingBag className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="font-black text-lg">Ver Pedidos</h3>
          <p className="text-sm opacity-80 font-medium mt-1">
            {stats.pendingOrders > 0
              ? `Tenés ${stats.pendingOrders} pedido${stats.pendingOrders > 1 ? "s" : ""} pendiente${stats.pendingOrders > 1 ? "s" : ""}`
              : "Todos los pedidos al día"}
          </p>
          <ArrowRight className="w-5 h-5 mt-4 opacity-60 group-hover:translate-x-2 transition-transform" />
        </Link>

        <Link
          href="/admin/categories"
          className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white group hover:shadow-xl hover:shadow-purple-200 transition-all hover:scale-[1.02]"
        >
          <Tags className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="font-black text-lg">Categorías</h3>
          <p className="text-sm opacity-80 font-medium mt-1">{stats.totalCategories} categorías activas en el menú</p>
          <ArrowRight className="w-5 h-5 mt-4 opacity-60 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Últimos Pedidos</h3>
          <Link href="/admin/orders" className="text-[10px] font-black text-btn-blue uppercase tracking-widest hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">Aún no hay pedidos. ¡Pronto llegarán!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.map((order) => {
              const isPending = order.status === "pendiente" || order.status === "pendiente_confirmacion";
              const isCompleted = order.status === "completado";
              return (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted ? "bg-green-50 text-green-500" : isPending ? "bg-amber-50 text-amber-500" : "bg-gray-50 text-gray-400"
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{order.customer_name || "Sin nombre"}</p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {order.customer_phone} · {new Date(order.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-black text-gray-900">${Number(order.total).toFixed(2)}</p>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                      isCompleted ? "text-green-500" : isPending ? "text-amber-500" : "text-gray-400"
                    }`}>
                      {isCompleted ? "Completado" : isPending ? "Pendiente" : order.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
