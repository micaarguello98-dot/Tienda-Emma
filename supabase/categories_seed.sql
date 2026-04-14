-- Ejecutar en Supabase → SQL Editor (una vez).
-- Slugs usados en la tienda: bebes | ninas | ninos | accesorios

INSERT INTO public.categories (name, slug)
SELECT v.name, v.slug
FROM (
  VALUES
    ('Bebés', 'bebes'),
    ('Niñas', 'ninas'),
    ('Niños', 'ninos'),
    ('Accesorios', 'accesorios')
) AS v(name, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.slug = v.slug
);

-- Recomendado: índice único en slug para integridad y para usar ON CONFLICT en migraciones futuras:
-- ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
