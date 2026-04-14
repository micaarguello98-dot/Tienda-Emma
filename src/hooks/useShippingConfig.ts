"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { parseMoney } from "@/lib/shipping";

const KEYS = [
  "shipping_base",
  "shipping_percent",
  "shipping_info",
  "shipping_delivery_hint",
] as const;

export type ShippingConfigState = {
  base: number;
  percent: number;
  info: string;
  deliveryHint: string;
  loading: boolean;
};

export function useShippingConfig(): ShippingConfigState {
  const [base, setBase] = useState(0);
  const [percent, setPercent] = useState(0);
  const [info, setInfo] = useState("");
  const [deliveryHint, setDeliveryHint] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("site_config")
        .select("key, value")
        .in("key", [...KEYS]);
      if (cancelled) return;
      const map: Record<string, string> = {};
      data?.forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value ?? "";
      });
      setBase(parseMoney(map.shipping_base));
      setPercent(parseMoney(map.shipping_percent));
      setInfo(map.shipping_info ?? "");
      setDeliveryHint(map.shipping_delivery_hint ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { base, percent, info, deliveryHint, loading };
}
