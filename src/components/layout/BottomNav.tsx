"use client";

import { Home, Search, Heart, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Inicio", href: "/", match: (p: string) => p === "/" },
  { icon: Search, label: "Buscar", href: "/search", match: (p: string) => p.startsWith("/search") },
  { icon: Heart, label: "Favoritos", href: "/favorites", match: (p: string) => p.startsWith("/favorites") },
  { icon: ClipboardList, label: "Pedidos", href: "/orders", match: (p: string) => p.startsWith("/orders") },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed z-[90] bg-white/90 backdrop-blur-lg border border-gray-100/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2rem]",
        "bottom-4 left-3 right-3",
        "md:bottom-6 md:left-1/2 md:right-auto md:w-full md:max-w-3xl md:-translate-x-1/2 md:px-3 md:py-2.5",
        "px-1.5 py-2"
      )}
    >
      <div className="flex items-stretch justify-between gap-0 max-w-3xl mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200",
                isActive ? "text-btn-blue bg-blue-50/70" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className={cn("w-5 h-5 md:w-6 md:h-6 shrink-0", isActive && "stroke-[2.5px]")} />
              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold leading-tight text-center truncate w-full px-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
