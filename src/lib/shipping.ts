export function parseMoney(value: string | undefined): number {
  if (value == null || value === "") return 0;
  const n = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** Envío = base fija + porcentaje del subtotal (configurado por el vendedor). */
export function estimateShipping(subtotal: number, base: number, percent: number): number {
  const raw = base + (subtotal * percent) / 100;
  return Math.round(Math.max(0, raw) * 100) / 100;
}
