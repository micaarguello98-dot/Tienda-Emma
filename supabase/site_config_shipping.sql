-- Configuración de envíos (carrito + panel admin).
-- Valores por defecto vacíos o cero; el vendedor los completa en Configuración.

INSERT INTO public.site_config (key, value) VALUES
  ('shipping_base', '0'),
  ('shipping_percent', '0'),
  ('shipping_info', ''),
  ('shipping_delivery_hint', '')
ON CONFLICT (key) DO NOTHING;
