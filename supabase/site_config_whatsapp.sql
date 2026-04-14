-- Número de WhatsApp del vendedor (pedidos y botón flotante).
-- Solo dígitos: código de país + número (ej. México 52 + 10 dígitos).
-- Ejecutar una vez si la fila no existe; si tu tabla usa otra clave única, ajústalo.

INSERT INTO public.site_config (key, value)
VALUES ('whatsapp_phone', '')
ON CONFLICT (key) DO NOTHING;
