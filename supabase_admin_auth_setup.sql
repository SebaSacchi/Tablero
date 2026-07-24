-- Contraseña compartida para los paneles de administración del tablero
-- (admin.html, admin-plus.html, admin-loterias.html, upload.html).
--
-- Ejecutar UNA SOLA VEZ en el SQL Editor de Supabase.
--
-- La contraseña se guarda en una tabla sin ninguna policy de acceso
-- (RLS habilitado, sin policies = nadie puede leer ni escribir la tabla
-- directamente con la anon key). El unico acceso es a traves de las
-- funciones de abajo, que corren con permisos de "security definer" y
-- solo devuelven true/false: la contraseña real nunca viaja al navegador.

create table if not exists admin_auth (
  id boolean primary key default true,
  password text not null,
  actualizado_en timestamptz not null default now(),
  constraint admin_auth_single_row check (id)
);

alter table admin_auth enable row level security;

create or replace function existe_admin_password()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from admin_auth);
$$;

create or replace function crear_admin_password(nuevo text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists(select 1 from admin_auth) then
    return false;
  end if;
  insert into admin_auth (id, password) values (true, nuevo);
  return true;
end;
$$;

create or replace function verificar_admin_password(intento text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from admin_auth where password = intento);
$$;

create or replace function set_admin_password(actual text, nuevo text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists(select 1 from admin_auth where password = actual) then
    return false;
  end if;
  update admin_auth set password = nuevo, actualizado_en = now() where id = true;
  return true;
end;
$$;

grant execute on function existe_admin_password() to anon, authenticated;
grant execute on function crear_admin_password(text) to anon, authenticated;
grant execute on function verificar_admin_password(text) to anon, authenticated;
grant execute on function set_admin_password(text, text) to anon, authenticated;
