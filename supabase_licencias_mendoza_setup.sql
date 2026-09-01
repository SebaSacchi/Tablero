-- =====================================================================
-- LICENCIAS - Habilitar el sorteo de Mendoza por agencia (Supabase)
-- =====================================================================
-- Este script es seguro de ejecutar mas de una vez (idempotente).
-- NO toca ninguna tabla existente, solo agrega una columna a "licencias"
-- y una funcion publica para consultarla.
--
-- Para que sirve:
--   El sorteo de Mendoza solo se muestra en algunas agencias (CABA),
--   no en todas (Provincia no lo quiere ver). Por defecto NINGUNA
--   licencia lo muestra: vos elegis, desde el Panel de Licencias,
--   que agencias (por su codigo) lo tienen habilitado.
--
-- Como ejecutarlo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menu izquierdo -> SQL Editor -> "New query"
--   3. Pega todo este archivo completo
--   4. Click en "Run" (o Ctrl+Enter)
-- =====================================================================

alter table public.licencias
  add column if not exists sorteo_mendoza boolean not null default false;

-- Funcion publica (anon): cada tablero instalado consulta con su propio
-- codigo si tiene habilitado el sorteo de Mendoza. No expone ninguna
-- otra columna de la tabla.
create or replace function public.licencia_muestra_mendoza(p_codigo text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select sorteo_mendoza from licencias where codigo = p_codigo),
    false
  );
$$;

grant execute on function public.licencia_muestra_mendoza(text) to anon, authenticated;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
