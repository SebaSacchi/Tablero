-- =====================================================================
-- RIFA - Setup de base de datos (Supabase)
-- =====================================================================
-- Este script es seguro de ejecutar mas de una vez (idempotente).
-- NO toca ninguna tabla existente del Tablero Agencia.
-- Crea UNICAMENTE la tabla rifa_numeros y sus dependencias.
--
-- Como ejecutarlo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menu izquierdo -> SQL Editor -> "New query"
--   3. Pega todo este archivo completo
--   4. Click en "Run" (o Ctrl+Enter)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLA
-- ---------------------------------------------------------------------
create table if not exists public.rifa_numeros (
  id             bigint generated always as identity primary key,
  numero         integer not null,
  estado         text not null default 'disponible',
  nombre         text,
  telefono       text,
  importe        numeric(12, 2) not null default 2500,
  forma_pago     text,
  vendido_por    text default 'FAUSTO',
  notas          text,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. RESTRICCIONES
-- ---------------------------------------------------------------------
alter table public.rifa_numeros
  drop constraint if exists rifa_numeros_numero_unique;
alter table public.rifa_numeros
  add constraint rifa_numeros_numero_unique unique (numero);

alter table public.rifa_numeros
  drop constraint if exists rifa_numeros_numero_rango;
alter table public.rifa_numeros
  add constraint rifa_numeros_numero_rango check (numero >= 1 and numero <= 140);

alter table public.rifa_numeros
  drop constraint if exists rifa_numeros_estado_valido;
alter table public.rifa_numeros
  add constraint rifa_numeros_estado_valido
  check (estado in ('disponible', 'reservado', 'vendido', 'pagado'));

alter table public.rifa_numeros
  drop constraint if exists rifa_numeros_forma_pago_valida;
alter table public.rifa_numeros
  add constraint rifa_numeros_forma_pago_valida
  check (forma_pago is null or forma_pago in ('Transferencia', 'Efectivo', 'Mercado Pago', 'Otro'));

-- ---------------------------------------------------------------------
-- 3. CARGA INICIAL DE NUMEROS 1 A 140 (no duplica si ya existen)
-- ---------------------------------------------------------------------
insert into public.rifa_numeros (numero, estado, importe, vendido_por)
select n, 'disponible', 2500, 'FAUSTO'
from generate_series(1, 140) as n
on conflict (numero) do nothing;

-- ---------------------------------------------------------------------
-- 4. INDICES UTILES
-- ---------------------------------------------------------------------
create index if not exists idx_rifa_numeros_estado on public.rifa_numeros (estado);
create index if not exists idx_rifa_numeros_numero on public.rifa_numeros (numero);
create index if not exists idx_rifa_numeros_nombre on public.rifa_numeros (lower(nombre));
create index if not exists idx_rifa_numeros_telefono on public.rifa_numeros (telefono);

-- ---------------------------------------------------------------------
-- 5. TRIGGER: actualizar automaticamente actualizado_en
-- ---------------------------------------------------------------------
create or replace function public.rifa_numeros_set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists trg_rifa_numeros_actualizado_en on public.rifa_numeros;
create trigger trg_rifa_numeros_actualizado_en
  before update on public.rifa_numeros
  for each row
  execute function public.rifa_numeros_set_actualizado_en();

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.rifa_numeros enable row level security;

drop policy if exists "rifa_numeros_select_auth" on public.rifa_numeros;
create policy "rifa_numeros_select_auth"
  on public.rifa_numeros for select
  to authenticated
  using (true);

drop policy if exists "rifa_numeros_insert_auth" on public.rifa_numeros;
create policy "rifa_numeros_insert_auth"
  on public.rifa_numeros for insert
  to authenticated
  with check (true);

drop policy if exists "rifa_numeros_update_auth" on public.rifa_numeros;
create policy "rifa_numeros_update_auth"
  on public.rifa_numeros for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "rifa_numeros_delete_auth" on public.rifa_numeros;
create policy "rifa_numeros_delete_auth"
  on public.rifa_numeros for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 7. REALTIME
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rifa_numeros'
  ) then
    alter publication supabase_realtime add table public.rifa_numeros;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 8. TABLA DE CONFIGURACION (destino, premios, valor, datos de transferencia)
-- ---------------------------------------------------------------------
create table if not exists public.rifa_config (
  id             integer primary key default 1,
  destino        text not null default 'Santa Fe',
  motivo         text not null default 'Para representarnos en un torneo de vóley',
  premio_1       text not null default 'Fernet con Coca',
  premio_2       text default 'Camiseta de la Selección Argentina',
  valor          numeric(12, 2) not null default 2500,
  alias          text default '',
  cvu            text default '',
  nombre         text default '',
  actualizado_en timestamptz not null default now(),
  constraint rifa_config_single_row check (id = 1)
);

insert into public.rifa_config (id)
values (1)
on conflict (id) do nothing;

create or replace function public.rifa_config_set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists trg_rifa_config_actualizado_en on public.rifa_config;
create trigger trg_rifa_config_actualizado_en
  before update on public.rifa_config
  for each row
  execute function public.rifa_config_set_actualizado_en();

alter table public.rifa_config enable row level security;

drop policy if exists "rifa_config_select_auth" on public.rifa_config;
create policy "rifa_config_select_auth"
  on public.rifa_config for select
  to authenticated
  using (true);

drop policy if exists "rifa_config_update_auth" on public.rifa_config;
create policy "rifa_config_update_auth"
  on public.rifa_config for update
  to authenticated
  using (true)
  with check (true);

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
