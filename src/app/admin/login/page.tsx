"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// Credenciales del admin (independiente de Supabase auth)
const ADMIN_EMAIL = "barbara@gmail.com";
const ADMIN_PASSWORD = "mundoemma2026"; // Cambiá esto por la contraseña que quieras

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simular un pequeño delay para UX
    await new Promise((r) => setTimeout(r, 500));

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // Guardar sesión de admin en localStorage (independiente de Supabase)
    localStorage.setItem("admin_session", JSON.stringify({
      email: ADMIN_EMAIL,
      loggedAt: new Date().toISOString(),
    }));

    setLoading(false);
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-btn-blue text-white shadow-lg shadow-blue-200/50 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Administración <span className="text-btn-blue">Mundo Emma</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Acceso exclusivo para la administradora.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 space-y-5"
        >
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
              Correo
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/40"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/40"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white bg-btn-blue shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-2",
              loading && "opacity-80 cursor-wait"
            )}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar al panel"}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          ¿Cliente?{" "}
          <a href="/" className="text-btn-blue font-bold hover:underline">
            Ir a la tienda
          </a>
        </p>
      </div>
    </div>
  );
}
