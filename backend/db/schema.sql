-- Sales app: salespeople, their leads, quotations and orders.
-- Run in the Supabase SQL editor (the enum change must run on its own first).

-- 1. New role. Run this line alone, then the rest.
alter type user_role add value if not exists 'sales';

-- 2. Leads: one enquiry from a customer, owned by one salesperson.
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  salesperson_id uuid not null references users(id),
  customer_name text not null,
  phone         text not null,
  area          text,
  interest      text,                      -- Purifier / Softener / Ionizer / Custom cabinet / Other
  source        text,                      -- walk-in / call / reference / dealer / website
  status        text not null default 'new'
                check (status in ('new','contacted','demo','quoted','won','lost')),
  next_follow_up date,
  note          text,
  lost_reason   text,
  client_id     text unique,               -- idempotency for offline retries
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_leads_salesperson on leads (salesperson_id, status);
create index if not exists idx_leads_follow_up on leads (next_follow_up);

-- 3. Timeline of everything that happened on a lead.
create table if not exists lead_events (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  user_id    uuid references users(id),
  kind       text not null,                -- created / status / note / follow_up / quote / order
  text       text,
  created_at timestamptz not null default now()
);
create index if not exists idx_lead_events_lead on lead_events (lead_id, created_at);

-- 4. Quotations: items are [{model, mrp, qty}] from the app catalogue.
create table if not exists quotations (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  salesperson_id uuid not null references users(id),
  items       jsonb not null default '[]',
  discount    numeric not null default 0,
  total       numeric not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_quotations_lead on quotations (lead_id);

-- 5. Orders: a won lead.
create table if not exists sales_orders (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id),
  salesperson_id uuid not null references users(id),
  quotation_id uuid references quotations(id),
  items       jsonb not null default '[]',
  total       numeric not null default 0,
  advance     numeric not null default 0,
  status      text not null default 'booked'
              check (status in ('booked','dispatched','installation','completed','cancelled')),
  ticket_id   uuid,                        -- installation job raised for the technicians
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_sales_orders_salesperson on sales_orders (salesperson_id, created_at);
