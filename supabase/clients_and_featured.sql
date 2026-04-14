-- Ejecutar en Supabase → SQL Editor
-- 1) Galería "Mis clientes"  2) Marcar productos destacados en el inicio

CREATE TABLE IF NOT EXISTS public.client_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products (is_featured) WHERE is_featured = true;

-- Lectura pública de fotos (tienda). Ajusta según tu modelo de seguridad.
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_photos_select_public" ON public.client_photos;
CREATE POLICY "client_photos_select_public"
  ON public.client_photos FOR SELECT
  USING (true);

-- Insertar / editar / borrar solo con sesión (mismo requisito que el panel)
DROP POLICY IF EXISTS "client_photos_all_authenticated" ON public.client_photos;
CREATE POLICY "client_photos_all_authenticated"
  ON public.client_photos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Si el INSERT sigue fallando, confirma que iniciaste sesión en la tienda (no solo el panel sin auth).
-- Storage: ejecuta también supabase/storage_tienda_emma.sql para permitir subidas al bucket.
