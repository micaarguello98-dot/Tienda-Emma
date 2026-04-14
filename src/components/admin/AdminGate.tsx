"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";
import { AdminShell } from "./AdminShell";

const ADMIN_EMAIL = "barbara@gmail.com";

function isPublicAdminPath(pathname: string | null) {
  return pathname === "/admin/login" || pathname?.startsWith("/admin/login/");
}

/** Verifica si hay sesión de admin en localStorage */
function getAdminSession(): { email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("admin_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email === ADMIN_EMAIL) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    if (isPublicAdminPath(pathname)) {
      setStatus("allowed");
      return;
    }

    const session = getAdminSession();
    if (session) {
      setStatus("allowed");
    } else {
      setStatus("denied");
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  // Rutas públicas (login)
  if (isPublicAdminPath(pathname)) {
    return <>{children}</>;
  }

  // Verificando o redirigiendo
  if (status === "checking" || status === "denied") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-btn-blue" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {status === "denied" ? "Redirigiendo al login…" : "Verificando acceso…"}
        </p>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
