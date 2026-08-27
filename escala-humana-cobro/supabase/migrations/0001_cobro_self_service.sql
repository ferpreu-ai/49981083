-- Fase 0: esquema de datos para el cobro self-service de Escala Humana.
--
-- ATENCIÓN: este archivo asume que ya existe una tabla `grupos` (la que hoy
-- usa /api/send-access-email y /api/send-group-email para el alta manual).
-- Antes de aplicar esta migración contra el proyecto real, revisá que las
-- columnas que referencia (id, clave) coincidan con tu tabla — si tu tabla
-- usa otros nombres, ajustalos acá primero.

create extension if not exists pgcrypto;

-- Un registro por cada intento de compra (Individual o Equipo).
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  plan text not null check (plan in ('individual', 'equipo')),
  nombre text not null,
  email text not null,
  empresa text,
  asientos_solicitados int not null default 1,
  monto_usd numeric(10,2) not null,
  monto_ars numeric(12,2),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobado', 'en_revision', 'rechazado')),
  mp_preference_id text,
  mp_payment_id text,
  grupo_id uuid references grupos(id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists pedidos_email_idx on pedidos (email);
create index if not exists pedidos_mp_preference_idx on pedidos (mp_preference_id);
create index if not exists pedidos_mp_payment_idx on pedidos (mp_payment_id);

-- Vincula un grupo a su pedido de origen y le pone tope de asientos.
-- Si tu tabla `grupos` ya tiene una columna de nombre distinto para el
-- código de acceso (no `clave`), ajustá el resto de este módulo.
alter table grupos add column if not exists pedido_id uuid references pedidos(id);
alter table grupos add column if not exists asientos_max int not null default 10;
alter table grupos add column if not exists origen text not null default 'manual'
  check (origen in ('manual', 'self_service'));
alter table grupos add column if not exists token_acceso text unique
  default encode(gen_random_bytes(16), 'hex');
