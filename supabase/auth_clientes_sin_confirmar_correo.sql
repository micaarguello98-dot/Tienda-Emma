-- INSTRUCCIONES (no copies esto si el editor pega raro; lee con calma)
--
-- A) Lo importante NO es este SQL: en Supabase ve a
--    Authentication -> Providers -> Email -> desactiva "Confirm email"
--
-- B) Si solo quieres pegar SQL en el editor, abre el archivo:
--    supabase/paste_this_only.sql
--    Son 3 lineas. Copialo desde el archivo en el disco (Cursor/Bloc de notas),
--    no desde un chat, porque ahi a veces se pega "undefined".
--
-- C) Consulta opcional para ver usuarios:
-- SELECT id, email, email_confirmed_at FROM auth.users LIMIT 20;

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
