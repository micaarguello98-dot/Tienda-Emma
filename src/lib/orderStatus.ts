import type { OrderStatus } from "@/types/order";

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string; description: string }[] =
  [
    {
      value: "pendiente_confirmacion",
      label: "Pendiente",
      description: "Recién pedido por WhatsApp",
    },
    {
      value: "confirmado",
      label: "Confirmado",
      description: "La tienda confirmó el pedido",
    },
    {
      value: "en_preparacion",
      label: "En preparación",
      description: "Armando / embalando",
    },
    { value: "enviado", label: "Enviado", description: "Ya salió / en camino" },
    {
      value: "completado",
      label: "Pedido completo",
      description: "Venta concretada",
    },
    {
      value: "rechazado",
      label: "Rechazado",
      description: "No se concreta la venta",
    },
    {
      value: "cancelado",
      label: "Cancelado",
      description: "Anulado por cliente o tienda",
    },
  ];

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

/** Compatibilidad con pedidos viejos (pendiente → pendiente_confirmacion, etc.) */
export function normalizeOrderStatus(status: string): OrderStatus {
  const legacy: Record<string, OrderStatus> = {
    pendiente: "pendiente_confirmacion",
    entregado: "completado",
  };
  if (legacy[status]) return legacy[status];
  if (ORDER_STATUS_OPTIONS.some((o) => o.value === status)) {
    return status as OrderStatus;
  }
  return "pendiente_confirmacion";
}
