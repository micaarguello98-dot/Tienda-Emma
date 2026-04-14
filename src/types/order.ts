export type OrderStatus =
  | "pendiente_confirmacion"
  | "confirmado"
  | "en_preparacion"
  | "enviado"
  | "completado"
  | "rechazado"
  | "cancelado";

export interface OrderLineItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image?: string;
  category?: string;
}

export interface ShopOrder {
  id: string;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  shipping_note: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  line_items: OrderLineItem[];
  user_id: string | null;
  public_token: string;
}
