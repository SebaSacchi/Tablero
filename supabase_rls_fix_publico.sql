-- =====================================================================
-- FIX RLS - Tablas publicas sin Row Level Security
-- =====================================================================
-- Supabase (Security Advisor) detecto "rls_disabled_in_public": las
-- tablas config_tablero, resultados_quiniela, resultados_plus y
-- resultados_loterias no tienen Row Level Security habilitado. Sin
-- RLS, cualquiera que tenga la URL del proyecto y la anon key (que
-- viaja publica en app.js/admin.html, eso es normal) puede leer,
-- insertar, modificar o BORRAR filas directo contra la REST API,
-- sin pasar ni por el tablero ni por el panel de admin.
--
-- Que necesita realmente cada tabla (repasado en el codigo):
--   - config_tablero, resultados_plus, resultados_loterias:
--       * El tablero publico (index.html / app.js) SOLO LEE, sin
--         haber iniciado sesion -> select para "anon".
--       * admin.html LEE y hace upsert (insert+update, nunca delete).
--         admin.html ahora inicia sesion de verdad con Supabase Auth
--         (ver admin-auth.js) y manda el token de esa sesion en cada
--         escritura, asi que insert/update se restringen a
--         "authenticated" -> ya no cualquiera con la anon key puede
--         escribir, solo quien inicio sesion con el usuario admin.
--   - resultados_quiniela:
--       * El tablero publico SOLO LEE.
--       * Se escribe desde un script aparte (tablero_sync.py, fuera
--         de este repo) que usa la SERVICE ROLE KEY por variable de
--         entorno, no la anon key. La service role IGNORA RLS por
--         completo, asi que esta tabla no necesita ninguna policy de
--         insert/update/delete para nadie.
--
-- Ninguna de las 4 tablas se borra (DELETE) desde el frontend, asi que
-- no se crea policy de delete para nadie salvo el dueño del proyecto
-- (via el SQL Editor, que corre como owner y no esta sujeto a RLS).
--
-- PASO PREVIO OBLIGATORIO - crear el usuario admin en Supabase Auth:
--   admin.html ya no usa un password guardado en una tabla propia:
--   ahora pide email + contraseña y valida contra Supabase Auth, igual
--   que licencias.html. Antes de correr este script (o al menos antes
--   de que alguien vuelva a entrar a admin.html):
--     1. Supabase -> Authentication -> Users -> Add user
--     2. Cargá tu email y una contraseña (podés reusar el mismo
--        usuario que ya tengas para licencias.html si querés).
--     3. Con eso ya podés loguearte en admin.html.
--   La vieja contraseña de admin_auth (la que se creaba desde el panel
--   la primera vez) queda sin uso.
--
-- Antes de correr esto: se recomienda ejecutar primero el diagnostico
-- del final del archivo (o pegarlo solo) para confirmar que estas son
-- las unicas tablas de "public" con RLS apagado.
--
-- Como ejecutarlo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menu izquierdo -> SQL Editor -> "New query"
--   3. Pega todo este archivo completo
--   4. Click en "Run" (o Ctrl+Enter)
-- =====================================================================

-- ---------------------------------------------------------------------
-- CONFIG_TABLERO
-- Guarda pares clave/valor de configuracion (feriados, videos de promo
-- lateral, proximos sorteos manuales, etc).
-- ---------------------------------------------------------------------
alter table public.config_tablero enable row level security;

-- Lectura publica: el tablero (TVs/PCs de las agencias) necesita leer
-- la config sin haber iniciado sesion.
drop policy if exists "config_tablero_select_anon" on public.config_tablero;
create policy "config_tablero_select_anon"
  on public.config_tablero for select
  to anon
  using (true);

-- Insert/update solo para el admin logueado (ver nota arriba).
drop policy if exists "config_tablero_insert_anon" on public.config_tablero;
drop policy if exists "config_tablero_insert_auth" on public.config_tablero;
create policy "config_tablero_insert_auth"
  on public.config_tablero for insert
  to authenticated
  with check (true);

drop policy if exists "config_tablero_update_anon" on public.config_tablero;
drop policy if exists "config_tablero_update_auth" on public.config_tablero;
create policy "config_tablero_update_auth"
  on public.config_tablero for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- RESULTADOS_PLUS
-- Resultados de Quiniela Plus que carga admin.html.
-- ---------------------------------------------------------------------
alter table public.resultados_plus enable row level security;

drop policy if exists "resultados_plus_select_anon" on public.resultados_plus;
create policy "resultados_plus_select_anon"
  on public.resultados_plus for select
  to anon
  using (true);

drop policy if exists "resultados_plus_insert_anon" on public.resultados_plus;
drop policy if exists "resultados_plus_insert_auth" on public.resultados_plus;
create policy "resultados_plus_insert_auth"
  on public.resultados_plus for insert
  to authenticated
  with check (true);

drop policy if exists "resultados_plus_update_anon" on public.resultados_plus;
drop policy if exists "resultados_plus_update_auth" on public.resultados_plus;
create policy "resultados_plus_update_auth"
  on public.resultados_plus for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- RESULTADOS_LOTERIAS
-- Resultados de Loto Plus / Quini 6 que carga admin.html.
-- ---------------------------------------------------------------------
alter table public.resultados_loterias enable row level security;

drop policy if exists "resultados_loterias_select_anon" on public.resultados_loterias;
create policy "resultados_loterias_select_anon"
  on public.resultados_loterias for select
  to anon
  using (true);

drop policy if exists "resultados_loterias_insert_anon" on public.resultados_loterias;
drop policy if exists "resultados_loterias_insert_auth" on public.resultados_loterias;
create policy "resultados_loterias_insert_auth"
  on public.resultados_loterias for insert
  to authenticated
  with check (true);

drop policy if exists "resultados_loterias_update_anon" on public.resultados_loterias;
drop policy if exists "resultados_loterias_update_auth" on public.resultados_loterias;
create policy "resultados_loterias_update_auth"
  on public.resultados_loterias for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- RESULTADOS_QUINIELA
-- Solo lectura publica. Se escribe con la SERVICE ROLE KEY desde
-- tablero_sync.py (fuera de este repo), que ignora RLS: por eso NO se
-- crea ninguna policy de insert/update/delete.
-- ---------------------------------------------------------------------
alter table public.resultados_quiniela enable row level security;

drop policy if exists "resultados_quiniela_select_anon" on public.resultados_quiniela;
create policy "resultados_quiniela_select_anon"
  on public.resultados_quiniela for select
  to anon
  using (true);

-- =====================================================================
-- FIN DEL SCRIPT PRINCIPAL
-- =====================================================================

-- ---------------------------------------------------------------------
-- LIMPIEZA OPCIONAL (correla aparte, y solo despues de haber entrado a
-- admin.html con el nuevo login de Supabase Auth y confirmar que anda):
-- borra la tabla y las funciones del password viejo de admin_auth, que
-- ya no se usan.
-- ---------------------------------------------------------------------
-- drop function if exists public.existe_admin_password();
-- drop function if exists public.crear_admin_password(text);
-- drop function if exists public.verificar_admin_password(text);
-- drop function if exists public.set_admin_password(text, text);
-- drop table if exists public.admin_auth;

-- ---------------------------------------------------------------------
-- DIAGNOSTICO (opcional): correlo solo, antes o despues, para ver el
-- estado de RLS de TODAS las tablas de "public". Si aparece alguna
-- tabla con rls_habilitado = false que no sea de las 4 de arriba,
-- avisame antes de exponerla: puede necesitar otras policies.
-- ---------------------------------------------------------------------
-- select schemaname, tablename, rowsecurity as rls_habilitado
-- from pg_tables
-- where schemaname = 'public'
-- order by tablename;
