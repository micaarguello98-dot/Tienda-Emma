"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PromoBanner = () => {
  const [bannerText, setBannerText] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerColor, setBannerColor] = useState("from-pink-500 to-rose-500");
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("site_config")
        .select("key, value")
        .in("key", ["promo_banner_text", "promo_banner_link", "promo_banner_color", "promo_banner_enabled"]);

      if (!data) return;

      const config: Record<string, string> = {};
      data.forEach((item: any) => { config[item.key] = item.value; });

      const enabled = config.promo_banner_enabled === "true" || config.promo_banner_enabled === "1";
      const text = (config.promo_banner_text || "").trim();

      if (enabled && text) {
        setBannerText(text);
        setBannerLink((config.promo_banner_link || "").trim());
        if (config.promo_banner_color) setBannerColor(config.promo_banner_color);
        setVisible(true);
      }
    })();
  }, []);

  if (!visible || dismissed || !bannerText) return null;

  const content = (
    <div className="flex items-center justify-center gap-2 md:gap-3 px-10 py-2.5 md:py-3 text-center">
      <Megaphone className="w-4 h-4 shrink-0 opacity-80" />
      <p className="text-[11px] md:text-sm font-bold leading-tight">{bannerText}</p>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`fixed top-20 md:top-24 left-0 right-0 z-40 bg-gradient-to-r ${bannerColor} text-white shadow-lg overflow-hidden`}
      >
        {bannerLink ? (
          <a href={bannerLink} className="block hover:opacity-90 transition-opacity">
            {content}
          </a>
        ) : (
          content
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar banner"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
