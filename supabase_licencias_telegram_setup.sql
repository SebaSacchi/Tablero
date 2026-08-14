-- =====================================================================
-- LICENCIAS - Autorizacion de envio automatico a Telegram (Supabase)
-- =====================================================================
-- Este script es seguro de ejecutar mas de una vez (idempotente).
-- NO toca ninguna tabla existente, solo agrega una columna a "licencias"
-- y una funcion publica para consultarla.
--
-- Para que sirve:
--   El tablero esta instalado en varios dispositivos (PCs y TVs Android
--   de distintas agencias). Por defecto NINGUNO manda captura automatica
--   a Telegram: vos elegis, desde el Panel de Licencias, cuales
--   dispositivos (por su codigo) quedan autorizados a hacerlo.
--
-- Como ejecutarlo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menu izquierdo -> SQL Editor -> "New query"
--   3. Pega todo este archivo completo
--   4. Click en "Run" (o Ctrl+Enter)
-- =====================================================================

alter table public.licencias
  add column if not exists envia_telegram boolean not null default false;

-- Funcion publica (anon): cada tablero instalado consulta con su propio
-- codigo si esta autorizado a mandar la captura automatica a Telegram.
-- No expone ninguna otra columna de la tabla.
create or replace function public.licencia_envia_telegram(p_codigo text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select envia_telegram from licencias where codigo = p_codigo),
    false
  );
$$;

grant execute on function public.licencia_envia_telegram(text) to anon, authenticated;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
