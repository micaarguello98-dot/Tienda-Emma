"use client";
import { imagePath, cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, User, ShoppingCart, X, ChevronRight, Home, Heart, Package, Star, Search, Truck, LogOut, LogIn, UserPlus, Tag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useRef } from "react";

interface NavCategory {
  id: string;
  name: string;
  range: string | null;
}

export const Header = () => {
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Fetch categories for nav menu
    supabase
      .from("categories")
      .select("id, name, range")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setNavCategories(data);
      });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#bee6f2] px-3 md:px-4 h-20 md:h-24 flex items-center justify-between shadow-sm border-b border-blue-50/50">
        <div className="flex items-center gap-1 relative z-10 w-fit">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 md:p-2 hover:bg-white/30 rounded-full transition-colors block md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 md:w-7 md:h-7 text-gray-800" />
          </button>
          
          <Link href="/shipping" className="hidden md:flex p-1.5 md:p-2 hover:bg-white/30 rounded-full transition-colors relative text-gray-800 items-center justify-center group" aria-label="Pedidos y envíos">
            <Truck className="w-6 h-6 group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        <Link 
          href="/" 
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full py-[10px] md:py-2 flex items-center justify-center z-50 transition-all duration-300",
            isSearchOpen ? "opacity-0 invisible md:opacity-100 md:visible" : "opacity-100 visible"
          )}
        >
          <Image 
            src={imagePath("/logo2.png")} 
            alt="Mundo Emma Logo" 
            width={600} 
            height={200} 
            className="h-full w-auto object-contain transition-transform hover:scale-105 drop-shadow-sm"
            style={{ 
              maskImage: "radial-gradient(ellipse at center, rgb(0,0,0) 75%, rgba(0,0,0,0) 100%)", 
              WebkitMaskImage: "radial-gradient(ellipse at center, rgb(0,0,0) 75%, rgba(0,0,0,0) 100%)" 
            }}
            priority
          />
        </Link>

        <div className="flex items-center gap-0.5 md:gap-2 relative z-10 w-fit">
            {!isSearchOpen && (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 md:p-2 hover:bg-white/30 rounded-full transition-colors relative text-gray-800 flex items-center justify-center group" 
                aria-label="Búsqueda"
              >
                <Search className="w-6 h-6 group-hover:scale-105 transition-transform" />
              </button>
            )}

          {/* User Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-1.5 md:p-2 hover:bg-white/30 rounded-full transition-colors relative text-gray-800 flex items-center justify-center group" 
              aria-label="Perfil"
            >
              <User className="w-6 h-6 group-hover:scale-105 transition-transform" />
              {user && (
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-[#bee6f2] rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-blue-50 overflow-hidden z-[110]"
                >
                  <div className="p-2">
                    {!user ? (
                      <>
                        <Link 
                          href="/profile" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-2xl transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-btn-blue group-hover:bg-btn-blue group-hover:text-white transition-colors">
                            <LogIn className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800 leading-none">Inicio de Sesión</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Ingresar con email</p>
                          </div>
                        </Link>
                        <Link 
                          href="/profile" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 rounded-2xl transition-colors group mt-1"
                        >
                          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                            <UserPlus className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800 leading-none">Registrarse</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Crear nueva cuenta</p>
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Cuenta activa</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                        </div>
                        <Link 
                          href="/profile" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-2xl transition-colors group"
                        >
                          <User className="w-5 h-5 text-gray-400 group-hover:text-btn-blue" />
                          <span className="text-sm font-bold text-gray-700">Mi Perfil</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-2xl transition-colors group mt-1 text-left"
                        >
                          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                          <span className="text-sm font-bold text-gray-700 group-hover:text-red-600">Cerrar Sesión</span>
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/cart" className="p-1.5 md:p-2 hover:bg-white/30 rounded-full transition-colors relative text-gray-800 flex items-center justify-center group" aria-label="Carrito">
            <ShoppingCart className="w-6 h-6 group-hover:scale-105 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#4FC3F7] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-[#bee6f2] min-w-[20px] text-center shadow-md -mt-0.5 mr-0.5">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Global Search Overlay - Full width on mobile, right-aligned on desktop */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSearch}
              className="absolute inset-0 flex items-center bg-[#bee6f2] z-[100] px-4 md:left-auto md:right-4 md:w-[320px] md:bg-transparent"
            >
              <div className="relative w-full flex items-center bg-white/80 backdrop-blur-md rounded-2xl border-2 border-white/50 shadow-sm overflow-hidden group h-12 md:h-10">
                <Search className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#4FC3F7] transition-colors" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué estás buscando?"
                  className="w-full h-full pl-12 pr-12 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-bold text-sm md:text-base"
                />
                <button 
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 p-2 hover:bg-gray-100/50 rounded-full transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Backdrop & Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60]"
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[70] shadow-[10px_0_40px_rgba(0,0,0,0.15)] flex flex-col"
            >
              <div className="h-24 bg-[#bee6f2] p-4 flex items-center justify-between border-b border-blue-100">
                <div className="flex-1 h-full py-1 flex items-center justify-start overflow-hidden">
                  <Image 
                    src={imagePath("/logo2.png")} 
                    alt="Mundo Emma Logo" 
                    width={300} 
                    height={100} 
                    className="h-full w-auto object-contain origin-left scale-125 ml-2"
                    style={{ 
                      maskImage: "radial-gradient(ellipse at center, rgb(0,0,0) 75%, rgba(0,0,0,0) 100%)", 
                      WebkitMaskImage: "radial-gradient(ellipse at center, rgb(0,0,0) 75%, rgba(0,0,0,0) 100%)" 
                    }}
                  />
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-white/40 hover:bg-white/80 rounded-full transition-colors ml-2 shadow-sm"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6 text-gray-800" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-3 bg-gray-50/50">
                {/* Fixed: Inicio */}
                <Link 
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-blue-100 border border-transparent active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4FC3F7] group-hover:bg-[#4FC3F7] group-hover:text-white transition-colors duration-300">
                      <Home className="w-5 h-5 drop-shadow-sm" />
                    </div>
                    <span className="font-bold text-gray-700 text-[15px]">Inicio</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 group-hover:text-btn-blue transition-all" />
                </Link>

                {/* Dynamic: Categories from Supabase */}
                {navCategories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    href="/categories"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-blue-100 border border-transparent active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4FC3F7] group-hover:bg-[#4FC3F7] group-hover:text-white transition-colors duration-300">
                        <Tag className="w-5 h-5 drop-shadow-sm" />
                      </div>
                      <span className="font-bold text-gray-700 text-[15px]">
                        {cat.name}{cat.range ? ` (${cat.range})` : ""}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 group-hover:text-btn-blue transition-all" />
                  </Link>
                ))}

                {/* Fixed: Pedidos y Envíos */}
                <Link 
                  href="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-blue-100 border border-transparent active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4FC3F7] group-hover:bg-[#4FC3F7] group-hover:text-white transition-colors duration-300">
                      <Truck className="w-5 h-5 drop-shadow-sm" />
                    </div>
                    <span className="font-bold text-gray-700 text-[15px]">Pedidos y Envíos</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 group-hover:text-btn-blue transition-all" />
                </Link>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 mt-auto">
                <p className="text-sm font-bold text-gray-500 text-center tracking-tight">
                  Mundo Emma © 2026
                </p>
                <p className="text-xs font-semibold text-gray-400 mt-1 text-center">
                  Adorable ropa para tus pequeños
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
