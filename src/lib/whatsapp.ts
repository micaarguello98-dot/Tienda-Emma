/** Solo dígitos, para enlaces wa.me (código de país + número, sin +). */
export function normalizeWhatsAppPhone(input: string): string {
  return input.replace(/\D/g, "");
}

export function buildOrderWhatsAppMessage(params: {
  customerName: string;
  customerPhone: string;
  address: string;
  items: { name: string; quantity: number; price: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingNote?: string;
  orderIdShort?: string;
}): string {
  const {
    customerName,
    customerPhone,
    address,
    items,
    subtotal,
    shipping,
    total,
    shippingNote,
    orderIdShort,
  } = params;
  const lines = items.map(
    (i) =>
      `• ${i.quantity}x ${i.name} — $${i.price.toFixed(2)} c/u → $${i.lineTotal.toFixed(2)}`
  );
  const noteBlock =
    shippingNote && shippingNote.trim().length > 0
      ? ["", `*Notas sobre el envío:*`, shippingNote.trim()]
      : [];
  const idLine =
    orderIdShort && orderIdShort.length > 0
      ? [`*Pedido registrado:* #${orderIdShort}`, ""]
      : [];
  return [
    "¡Hola! Quiero confirmar mi pedido en *Mundo Emma*:",
    ...idLine,
    "*Productos:*",
    ...lines,
    "",
    `*Subtotal productos:* $${subtotal.toFixed(2)}`,
    `*Envío (estimado por la tienda):* $${shipping.toFixed(2)}`,
    `*Total:* $${total.toFixed(2)}`,
    ...noteBlock,
    "",
    "*Datos de entrega:*",
    `Nombre: ${customerName}`,
    `Teléfono: ${customerPhone}`,
    `Dirección: ${address}`,
  ].join("\n");
}

export function buildWhatsAppUrl(phoneDigits: string, text: string): string | null {
  const p = normalizeWhatsAppPhone(phoneDigits);
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}
