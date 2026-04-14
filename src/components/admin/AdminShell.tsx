"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  PackageOpen,
  LogOut,
  Menu,
  X as CloseIcon,
  Images,
  Tags,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Resumen", href: "/admin", icon: LayoutDashboard },
    { name: "Productos", href: "/admin/products", icon: PackageOpen },
    { name: "Categorías", href: "/admin/categories", icon: Tags },
    { name: "Mis clientes", href: "/admin/clients", icon: Images },
    { name: "Pedidos", href: "/admin/orders", icon: ShoppingBag },
    { name: "Clientes", href: "/admin/customers", icon: Users },
    { name: "Configuración", href: "/admin/settings", icon: Settings },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-[60]">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          PANEL <span className="text-btn-blue">ADMIN</span>
        </h1>
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex-shrink-0 z-[56] transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="h-16 hidden md:flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            PANEL <span className="text-btn-blue">ADMIN</span>
          </h1>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive ? "bg-blue-50 text-btn-blue" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-btn-blue/80" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100 md:absolute md:bottom-0 md:w-64">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-80" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
