/** Slugs en BD → etiqueta que ve el cliente en la tienda */
const SLUG_TO_LABEL: Record<string, string> = {
  bebes: "BEBÉS",
  ninas: "NIÑAS",
  ninos: "NIÑOS",
  accesorios: "ACCESORIOS",
};

export function categoryLabelFromSlug(slug: string | undefined | null): string {
  if (!slug) return "PRODUCTO";
  const key = slug.toLowerCase();
  return SLUG_TO_LABEL[key] ?? slug.replace(/-/g, " ").toUpperCase();
}
