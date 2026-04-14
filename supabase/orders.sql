-- Pedidos (WhatsApp checkout). Ejecutar en Supabase → SQL → New query.
--
-- SI AL PEGAR TE SALE "undefined": no copies desde el chat de la IA.
-- Abrí ESTE archivo en Cursor (panel izquierdo), clic dentro, Ctrl+A, Ctrl+C,
-- y pegá en Supabase (Ctrl+V). Así el portapapeles trae el texto real del disco.
--
-- La vendedora: Authentication → Users → tu usuario → App metadata: { "admin": true }

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pendiente_confirmacion',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_address text NOT NULL,
  shipping_note text,
  subtotal numeric(12, 2) NOT NULL,
  shipping numeric(12, 2) NOT NULL DEFAULT 0,
  total numeric(12, 2) NOT NULL,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  public_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_public_token ON public.orders (public_token);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Insertar pedido desde la web (anon o logueado)
DROP POLICY IF EXISTS "orders_insert_public" ON public.orders;
CREATE POLICY "orders_insert_public" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Cliente logueado ve sus pedidos; admin: App metadata { "admin": true }
DROP POLICY IF EXISTS "orders_select_authenticated" ON public.orders;
CREATE POLICY "orders_select_authenticated" ON public.orders
  FOR SELECT TO authenticated
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (auth.jwt()->'app_metadata'->>'admin') = 'true'
  );

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'admin') = 'true')
  WITH CHECK ((auth.jwt()->'app_metadata'->>'admin') = 'true');

-- Invitados: sin SELECT directo; usan la función RPC de abajo

-- Lista pedidos por tokens guardados en el navegador (solo esas filas)
CREATE OR REPLACE FUNCTION public.get_orders_by_public_tokens(tokens uuid[])
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.orders
  WHERE public_token = ANY (tokens)
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_orders_by_public_tokens(uuid[]) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_orders_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_orders_updated_at();
