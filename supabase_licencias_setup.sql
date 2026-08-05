-- =====================================================================
-- LICENCIAS - Control remoto de activacion del tablero por agencia
-- =====================================================================
-- Permite activar/desactivar de forma remota el tablero publico
-- (index.html) instalado en cada agencia, para llevar control de
-- quien tiene el servicio activo.
--
-- Como ejecutarlo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menu izquierdo -> SQL Editor -> "New query"
--   3. Pega todo este archivo completo
--   4. Click en "Run" (o Ctrl+Enter)
--
-- Despues de correr esto, entra a Authentication -> Users -> Add user
-- y crea un usuario con TU email y una contrasena, para poder entrar
-- a licencias.html (el panel es solo tuyo, nadie mas puede leer esta
-- tabla sin haber iniciado sesion con ese usuario).
-- =====================================================================

create table if not exists public.licencias (
  codigo             text primary key,
  activo             boolean not null default false,
  agencia_nombre     text,
  agencia_legajo     text,
  agencia_titular    text,
  agencia_provincia  text,
  notas              text,
  creado_en          timestamptz not null default now(),
  activado_en        timestamptz
);

alter table public.licencias enable row level security;

-- Solo un usuario logueado (vos, via Supabase Auth) puede ver/editar
-- la lista completa de licencias.
drop policy if exists "licencias_select_auth" on public.licencias;
create policy "licencias_select_auth"
  on public.licencias for select
  to authenticated
  using (true);

drop policy if exists "licencias_update_auth" on public.licencias;
create policy "licencias_update_auth"
  on public.licencias for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "licencias_delete_auth" on public.licencias;
create policy "licencias_delete_auth"
  on public.licencias for delete
  to authenticated
  using (true);

-- Funcion publica (anon): cada tablero instalado la llama con su propio
-- codigo. Si el codigo no existe todavia lo registra como pendiente
-- (activo = false) y devuelve el estado actual. Nunca expone el resto
-- de la tabla, solo el booleano del codigo consultado.
create or replace function public.licencia_estado(p_codigo text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activo boolean;
begin
  insert into licencias (codigo) values (p_codigo)
  on conflict (codigo) do nothing;

  select activo into v_activo from licencias where codigo = p_codigo;
  return coalesce(v_activo, false);
end;
$$;

grant execute on function licencia_estado(text) to anon, authenticated;
