-- Políticas del bucket "tienda-emma" (Storage) para que usuarios autenticados puedan subir archivos.
-- Ejecutar en Supabase → SQL Editor si al subir fotos sale error de permisos (RLS).

-- Ajusta el nombre del bucket si el tuyo es distinto.
-- Comprueba en: Storage → buckets

-- Lectura pública (imágenes en la tienda)
DROP POLICY IF EXISTS "tienda_emma_public_read" ON storage.objects;
CREATE POLICY "tienda_emma_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tienda-emma');

-- Subida solo usuarios logueados (panel admin con sesión)
DROP POLICY IF EXISTS "tienda_emma_auth_upload" ON storage.objects;
CREATE POLICY "tienda_emma_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tienda-emma');

-- Actualizar / borrar propios archivos (opcional; útil para reemplazar imágenes)
DROP POLICY IF EXISTS "tienda_emma_auth_update" ON storage.objects;
CREATE POLICY "tienda_emma_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'tienda-emma')
  WITH CHECK (bucket_id = 'tienda-emma');

DROP POLICY IF EXISTS "tienda_emma_auth_delete" ON storage.objects;
CREATE POLICY "tienda_emma_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tienda-emma');
