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
--       * El tablero publico (index.html / app.js) SOLO LEE.
--       * admin.html LEE y hace upsert (insert+update, nunca delete)
--         usando la anon key, porque admin.html no usa Supabase Auth:
--         solo valida un password contra una funcion RPC (ver
--         supabase_admin_auth_setup.sql) y despues sigue llamando a
--         la REST API con la misma anon key de siempre. Por eso estas
--         3 tablas necesitan permitir insert/update anonimo: hoy es
--         indispensable para que el panel de admin no se rompa.
--   - resultados_quiniela:
--       * El tablero publico SOLO LEE.
--       * Se escribe desde un script aparte (tablero_sync.py, fuera
--         de este repo) que usa la SERVICE ROLE KEY por variable de
--         entorno, no la anon key. La service role IGNORA RLS por
--         completo, asi que esta tabla no necesita ninguna policy de
--         insert/update/delete para anon ni authenticated.
--
-- Ninguna de las 4 tablas se borra (DELETE) desde el frontend, asi que
-- no se crea policy de delete para nadie salvo el dueño del proyecto
-- (via el SQL Editor, que corre como owner y no esta sujeto a RLS).
--
-- IMPORTANTE - riesgo que queda (no se soluciona con este script):
-- como admin.html no usa Supabase Auth, cualquiera que consiga la
-- anon key (publica, no hay forma de evitarlo en un sitio 100%
-- frontend) puede escribir directo en config_tablero/resultados_plus/
-- resultados_loterias sin pasar por el password del panel. El
-- password de admin.html solo protege la UI, no la base. Si en algun
-- momento queres cerrar tambien ese hueco, la solucion es migrar
-- admin.html a Supabase Auth real (como ya funciona en licencias.html
-- y rifa.html) y cambiar estas policies de "to anon" a "to
-- authenticated". Es un cambio mas grande, no se aplica en este
-- script para no romper el panel actual.
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

-- Insert/update publico: admin.html escribe con la anon key (no usa
-- Supabase Auth). Ver nota de riesgo arriba.
drop policy if exists "config_tablero_insert_anon" on public.config_tablero;
create policy "config_tablero_insert_anon"
  on public.config_tablero for insert
  to anon
  with check (true);

drop policy if exists "config_tablero_update_anon" on public.config_tablero;
create policy "config_tablero_update_anon"
  on public.config_tablero for update
  to anon
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
create policy "resultados_plus_insert_anon"
  on public.resultados_plus for insert
  to anon
  with check (true);

drop policy if exists "resultados_plus_update_anon" on public.resultados_plus;
create policy "resultados_plus_update_anon"
  on public.resultados_plus for update
  to anon
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
create policy "resultados_loterias_insert_anon"
  on public.resultados_loterias for insert
  to anon
  with check (true);

drop policy if exists "resultados_loterias_update_anon" on public.resultados_loterias;
create policy "resultados_loterias_update_anon"
  on public.resultados_loterias for update
  to anon
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- RESULTADOS_QUINIELA
-- Solo lectura publica. Se escribe con la SERVICE ROLE KEY desde
-- tablero_sync.py (fuera de este repo), que ignora RLS: por eso NO se
-- crea ninguna policy de insert/update/delete para anon.
-- ---------------------------------------------------------------------
alter table public.resultados_quiniela enable row level security;

drop policy if exists "resultados_quiniela_select_anon" on public.resultados_quiniela;
create policy "resultados_quiniela_select_anon"
  on public.resultados_quiniela for select
  to anon
  using (true);

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================

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
