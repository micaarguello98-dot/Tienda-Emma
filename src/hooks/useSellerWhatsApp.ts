"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp";

/** Número del vendedor desde `site_config` (clave `whatsapp_phone`). */
export function useSellerWhatsApp() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "whatsapp_phone")
        .maybeSingle();
      if (!cancelled) {
        setRaw((data?.value as string | undefined)?.trim() ?? "");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const digits = normalizeWhatsAppPhone(raw);
  return { raw, digits, loading, configured: digits.length >= 8 };
}
