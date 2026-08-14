-- =====================================================================
-- TELEGRAM ENVIOS - Setup de base de datos (Supabase)
-- =====================================================================
-- Este script es seguro de ejecutar mas de una vez (idempotente).
-- NO toca ninguna tabla existente del Tablero Agencia.
-- Crea UNICAMENTE la tabla telegram_envios y sus dependencias.
--
-- Para que sirve:
--   Este mismo tablero esta instalado en varias PCs/agencias (cada una
--   con su propia licencia), y todas envian al mismo canal de Telegram.
--   Sin esta tabla, cada dispositivo decide por su cuenta (con su propio
--   localStorage) si ya mando la captura de un turno, asi que dos o mas
--   dispositivos terminan mandando el mismo turno por separado.
--   Esta tabla actua como "candado" compartido: el primer dispositivo
--   que logra insertar la fila (fecha, turno) es el unico que envia; el
--   resto choca contra la restriccion unique y no manda nada.
--
-- Como ejecutarlo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menu izquierdo -> SQL Editor -> "New query"
--   3. Pega todo este archivo completo
--   4. Click en "Run" (o Ctrl+Enter)
-- =====================================================================

create table if not exists public.telegram_envios (
  fecha       date not null,
  turno       text not null,
  enviado_en  timestamptz not null default now(),
  primary key (fecha, turno)
);

alter table public.telegram_envios enable row level security;

drop policy if exists "telegram_envios_select_anon" on public.telegram_envios;
create policy "telegram_envios_select_anon"
  on public.telegram_envios for select
  to anon
  using (true);

drop policy if exists "telegram_envios_insert_anon" on public.telegram_envios;
create policy "telegram_envios_insert_anon"
  on public.telegram_envios for insert
  to anon
  with check (true);

drop policy if exists "telegram_envios_delete_anon" on public.telegram_envios;
create policy "telegram_envios_delete_anon"
  on public.telegram_envios for delete
  to anon
  using (true);

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
