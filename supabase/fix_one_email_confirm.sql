-- Arreglar UN correo que ya existe pero no puede entrar (Email not confirmed)
-- 1) Cambia el correo entre comillas simples por el tuyo, exactamente igual.
-- 2) Ejecuta en Supabase -> SQL -> New query -> Run

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE lower(email) = lower('PON_AQUI_TU_CORREO@EJEMPLO.COM');
