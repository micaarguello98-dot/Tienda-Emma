"use client";

import { useTransition, useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Mail, Loader2, User, Lock, ArrowRight, UserPlus, LogIn, Heart, Package } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [authError, setAuthError] = useState<"none" | "email_not_confirmed" | "other">("none");
  const [authErrorDetail, setAuthErrorDetail] = useState<string>("");

  useEffect(() => {
    const sb = createClient();
    async function getUser() {
      const {
        data: { user },
      } = await sb.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoBanner(null);
    setAuthError("none");
    setAuthErrorDetail("");
    startTransition(async () => {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          const low = error.message.toLowerCase();
          if (
            low.includes("not confirmed") ||
            low.includes("email not confirmed") ||
            low.includes("email_not_confirmed")
          ) {
            setAuthError("email_not_confirmed");
          } else {
            setAuthError("other");
            setAuthErrorDetail(error.message);
          }
        } else {
          window.location.reload();
        }
        return;
      }

      // Registro: mismo correo + contraseña, sin Gmail si el proyecto no exige confirmación
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });

      if (error) {
        alert("No se pudo crear la cuenta: " + error.message);
        return;
      }

      if (data.session) {
        window.location.reload();
        return;
      }

      // Algunos proyectos devuelven usuario sin sesión: probamos entrar ya
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && signInData.session) {
        window.location.reload();
        return;
      }

      setMode("login");
      setInfoBanner(
        "Cuenta creada. Pulsa «Ingresar» con el mismo correo y contraseña. Si aún no entra, en Supabase → Authentication → Email desactiva la confirmación por correo (sin eso el sistema pide abrir el mail)."
      );
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-btn-blue w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <Header />

      <main className="max-w-screen-md mx-auto pt-28 md:pt-32 px-6">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 max-w-md mx-auto text-center">
          {user ? (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <User className="w-10 h-10 text-btn-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight uppercase">¡Hola!</h1>
                <p className="text-gray-500 font-bold mb-2 text-sm">{user.email}</p>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Tu cuenta sirve para favoritos e historial cuando estén conectados en la tienda.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <Heart className="w-5 h-5 text-pink-500 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pronto</p>
                  <p className="text-sm font-bold text-gray-800">Favoritos</p>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <Package className="w-5 h-5 text-btn-blue mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pronto</p>
                  <p className="text-sm font-bold text-gray-800">Mis pedidos</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-red-500 font-bold text-sm hover:underline py-2"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-6 text-left">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Tu cuenta</h1>
                <p className="text-sm text-gray-500 font-medium leading-snug">
                  <span className="text-btn-blue font-black">Opcional.</span> Correo y contraseña para guardar{" "}
                  <span className="text-gray-700 font-bold">favoritos</span> y, más adelante, tu{" "}
                  <span className="text-gray-700 font-bold">historial de compras</span>. Sin Gmail obligatorio: al
                  registrarte entras directo (revisa la configuración en Supabase si hace falta).
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full p-1 flex">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setInfoBanner(null);
                      setAuthError("none");
                    }}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                      mode === "login" ? "bg-white text-btn-blue shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Ingresar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setInfoBanner(null);
                      setAuthError("none");
                    }}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                      mode === "signup" ? "bg-white text-pink-500 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Registrarme
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
                  {mode === "login" ? (
                    <LogIn className="w-8 h-8 text-btn-blue" />
                  ) : (
                    <UserPlus className="w-8 h-8 text-pink-500" />
                  )}
                </div>
              </div>

              {infoBanner && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-900 leading-relaxed">
                  {infoBanner}
                </div>
              )}

              {authError === "email_not_confirmed" && (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-4 text-left space-y-3 text-xs text-red-950 leading-relaxed">
                  <p className="font-black uppercase tracking-wide text-red-800">Correo aún no confirmado</p>
                  <p>
                    Tu cuenta existe, pero Supabase está pidiendo confirmación por mail. Haz <strong>una</strong> de
                    estas dos cosas (la 1 es la mejor para todos los clientes nuevos):
                  </p>
                  <ol className="list-decimal pl-4 space-y-2 font-medium text-red-900/90">
                    <li>
                      En Supabase: <strong>Authentication</strong> → <strong>Providers</strong> → <strong>Email</strong>{" "}
                      → desactiva <strong>Confirm email</strong> (o “Enable email confirmations”). Guarda. Así los próximos
                      registros entran al instante.
                    </li>
                    <li>
                      Para <strong>tu correo ya creado</strong>, en <strong>SQL Editor</strong> ejecuta (cambia el
                      correo):
                    </li>
                  </ol>
                  <pre className="bg-white/80 border border-red-100 rounded-xl p-3 text-[11px] overflow-x-auto font-mono text-red-900 whitespace-pre-wrap break-all">
                    {`UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE lower(email) = lower('${email || "tu@correo.com"}');`}
                  </pre>
                  <p className="text-[11px] text-red-700/90">
                    Después vuelve a pulsar <strong>Entrar</strong> con la misma contraseña.
                  </p>
                </div>
              )}

              {authError === "other" && authErrorDetail && (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-800">
                  {authErrorDetail}
                </div>
              )}

              <div className="space-y-3">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-btn-blue transition-colors" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthError("none");
                    }}
                    placeholder="Correo electrónico"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-btn-blue transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError("none");
                    }}
                    placeholder="Contraseña (mín. 6 caracteres)"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-btn-blue/30 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "w-full text-white font-black uppercase tracking-widest py-4 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 mt-2",
                    mode === "login" ? "bg-btn-blue shadow-blue-200" : "bg-pink-500 shadow-pink-200"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      {mode === "login" ? "Entrar" : "Crear cuenta y entrar"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                Al continuar aceptas usar tu correo solo para esta tienda. No usamos Google para iniciar sesión: solo
                correo y contraseña.
              </p>
            </form>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
