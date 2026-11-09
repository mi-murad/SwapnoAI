-- Additive SaaS foundation. This migration does not import or delete local JSON data.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null unique,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  plan_tier text not null default 'starter' check (plan_tier in ('starter', 'growth', 'pro', 'agency')),
  trial_started_at timestamptz not null default now(),
  trial_expires_at timestamptz not null default (now() + interval '7 days'),
  trial_action_limit integer not null default 25 check (trial_action_limit >= 1),
  trial_actions_used integer not null default 0 check (trial_actions_used >= 0),
  trial_included_actions text[] not null default array['adviser', 'research', 'strategy', 'text_content']::text[]
    check (trial_included_actions <@ array['adviser', 'research', 'strategy', 'text_content']::text[]),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  name text not null,
  industry text not null default '',
  target_audience text not null default '',
  description text not null default '',
  tone text not null default '',
  products text not null default '',
  goals text not null default '',
  colors jsonb not null default '[]'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_brain_nodes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  node_type text not null check (node_type in ('pitch', 'value_proposition', 'competitor', 'rule', 'preference', 'persona', 'fact')),
  content jsonb not null,
  source text not null default 'user',
  is_verified boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'approved', 'failed')),
  report jsonb not null default '{}'::jsonb,
  source_metadata jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'approved', 'archived')),
  strategy jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_calendars (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  calendar_id uuid references public.content_calendars(id) on delete set null,
  title text not null,
  platform text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  scheduled_at timestamptz,
  body text not null default '',
  media jsonb not null default '[]'::jsonb,
  approval_user_id uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  remote_post_id text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status <> 'published') or (remote_post_id is not null and published_at is not null))
);

create table if not exists public.brand_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  object_key text not null unique,
  original_name text not null,
  media_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  model text not null,
  capability text not null,
  request_id text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  estimated_cost_usd numeric(12, 8) not null default 0 check (estimated_cost_usd >= 0),
  outcome text not null check (outcome in ('success', 'rate_limited', 'timeout', 'provider_error', 'rejected')),
  created_at timestamptz not null default now(),
  unique (workspace_id, request_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workspace_memberships_user_idx on public.workspace_memberships(user_id, workspace_id);
create index if not exists brain_nodes_workspace_idx on public.business_brain_nodes(workspace_id, created_at desc);
create index if not exists research_reports_workspace_idx on public.research_reports(workspace_id, created_at desc);
create index if not exists strategies_workspace_idx on public.strategies(workspace_id, created_at desc);
create index if not exists content_calendars_workspace_idx on public.content_calendars(workspace_id, starts_on);
create index if not exists content_items_workspace_schedule_idx on public.content_items(workspace_id, scheduled_at);
create index if not exists ai_usage_workspace_created_idx on public.ai_usage_events(workspace_id, created_at desc);
create index if not exists audit_logs_workspace_created_idx on public.audit_logs(workspace_id, created_at desc);

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
grant usage on schema private to service_role;

create table if not exists private.platform_trial_policy (
  singleton boolean primary key default true check (singleton),
  duration_days integer not null default 7 check (duration_days between 1 and 3650),
  action_limit integer not null default 25 check (action_limit >= 0),
  included_actions text[] not null default array['adviser', 'research', 'strategy', 'text_content']::text[]
    check (included_actions <@ array['adviser', 'research', 'strategy', 'text_content']::text[])
);
insert into private.platform_trial_policy (singleton) values (true) on conflict (singleton) do nothing;
revoke all on private.platform_trial_policy from public, anon, authenticated;
grant select, insert, update, delete on private.platform_trial_policy to service_role;

create or replace function public.create_workspace(workspace_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  clean_name text := trim(workspace_name);
  trial_policy record;
  new_workspace_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication is required to create a workspace.' using errcode = '42501';
  end if;
  if clean_name is null or length(clean_name) not between 1 and 160 then
    raise exception 'Workspace name must be between 1 and 160 characters.' using errcode = '22023';
  end if;

  select duration_days, action_limit, included_actions
    into strict trial_policy
    from private.platform_trial_policy
    where singleton = true;

  insert into public.workspaces (
    name,
    slug,
    owner_user_id,
    trial_started_at,
    trial_expires_at,
    trial_action_limit,
    trial_included_actions
  ) values (
    clean_name,
    coalesce(nullif(trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g')), ''), 'workspace')
      || '-' || substr(extensions.gen_random_uuid()::text, 1, 8),
    actor_id,
    now(),
    now() + make_interval(days => trial_policy.duration_days),
    trial_policy.action_limit,
    trial_policy.included_actions
  )
  returning id into new_workspace_id;

  insert into public.workspace_memberships (workspace_id, user_id, role)
    values (new_workspace_id, actor_id, 'owner');
  insert into public.business_profiles (workspace_id, name)
    values (new_workspace_id, clean_name);

  return new_workspace_id;
end;
$$;
revoke all on function public.create_workspace(text) from public, anon;
grant execute on function public.create_workspace(text) to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_profiles', 'workspaces', 'business_profiles', 'business_brain_nodes',
    'research_reports', 'strategies', 'content_calendars', 'content_items'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name
    );
  end loop;
end
$$;

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships membership
    where membership.workspace_id = target_workspace_id
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships membership
    where membership.workspace_id = target_workspace_id
      and membership.user_id = (select auth.uid())
      and membership.role = any (allowed_roles)
  );
$$;

create or replace function private.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspaces workspace
    where workspace.id = target_workspace_id
      and workspace.owner_user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.has_workspace_role(uuid, text[]) from public, anon;
revoke all on function private.is_workspace_owner(uuid) from public, anon;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid, text[]) to authenticated;
grant execute on function private.is_workspace_owner(uuid) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_profiles', 'workspaces', 'workspace_memberships', 'business_profiles',
    'business_brain_nodes', 'research_reports', 'strategies', 'content_calendars',
    'content_items', 'brand_assets', 'ai_usage_events', 'audit_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
  end loop;
end
$$;

grant select, insert, update, delete on public.user_profiles,
  public.workspace_memberships, public.business_profiles,
  public.business_brain_nodes, public.research_reports, public.strategies,
  public.content_calendars, public.content_items, public.brand_assets to authenticated;
grant select, delete on public.workspaces to authenticated;
grant update (name, slug) on public.workspaces to authenticated;
grant select on public.ai_usage_events, public.audit_logs to authenticated;

create policy "profiles_select_self" on public.user_profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profiles_insert_self" on public.user_profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "profiles_update_self" on public.user_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "workspaces_select_member" on public.workspaces for select to authenticated
  using (private.is_workspace_member(id));
create policy "workspaces_insert_owner" on public.workspaces for insert to authenticated
  with check (owner_user_id = (select auth.uid()));
create policy "workspaces_update_admin" on public.workspaces for update to authenticated
  using (private.has_workspace_role(id, array['owner', 'admin']))
  with check (private.has_workspace_role(id, array['owner', 'admin']));
create policy "workspaces_delete_owner" on public.workspaces for delete to authenticated
  using (private.has_workspace_role(id, array['owner']));

create policy "memberships_select_members" on public.workspace_memberships for select to authenticated
  using (private.is_workspace_member(workspace_id));
create policy "memberships_insert_initial_owner" on public.workspace_memberships for insert to authenticated
  with check (
    role = 'owner'
    and private.is_workspace_owner(workspace_id)
  );
create policy "memberships_insert_admin" on public.workspace_memberships for insert to authenticated
  with check (
    (private.has_workspace_role(workspace_id, array['owner']))
    or (role in ('editor', 'viewer') and private.has_workspace_role(workspace_id, array['admin']))
  );
create policy "memberships_update_owner" on public.workspace_memberships for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner']))
  with check (private.has_workspace_role(workspace_id, array['owner']));
create policy "memberships_update_admin" on public.workspace_memberships for update to authenticated
  using (role in ('editor', 'viewer') and private.has_workspace_role(workspace_id, array['admin']))
  with check (role in ('editor', 'viewer') and private.has_workspace_role(workspace_id, array['admin']));
create policy "memberships_delete_owner" on public.workspace_memberships for delete to authenticated
  using (private.has_workspace_role(workspace_id, array['owner']));
create policy "memberships_delete_admin" on public.workspace_memberships for delete to authenticated
  using (
    role in ('editor', 'viewer')
    and private.has_workspace_role(workspace_id, array['admin'])
  );

create policy "business_profiles_select_member" on public.business_profiles for select to authenticated
  using (private.is_workspace_member(workspace_id));
create policy "business_profiles_insert_editor" on public.business_profiles for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "business_profiles_update_editor" on public.business_profiles for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']))
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "business_profiles_delete_admin" on public.business_profiles for delete to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "business_brain_select_member" on public.business_brain_nodes for select to authenticated
  using (private.is_workspace_member(workspace_id));
create policy "business_brain_insert_editor" on public.business_brain_nodes for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "business_brain_update_editor" on public.business_brain_nodes for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']))
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "business_brain_delete_admin" on public.business_brain_nodes for delete to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "research_select_member" on public.research_reports for select to authenticated
  using (private.is_workspace_member(workspace_id));
create policy "research_insert_editor" on public.research_reports for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "research_update_editor" on public.research_reports for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']))
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "research_delete_admin" on public.research_reports for delete to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "strategies_select_member" on public.strategies for select to authenticated
  using (private.is_workspace_member(workspace_id));
create policy "strategies_insert_editor" on public.strategies for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "strategies_update_editor" on public.strategies for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']))
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "strategies_delete_admin" on public.strategies for delete to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "calendars_select_member" on public.content_calendars for select to authenticated
  using (private.is_workspace_member(workspace_id));
create policy "calendars_insert_editor" on public.content_calendars for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "calendars_update_editor" on public.content_calendars for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']))
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "calendars_delete_admin" on public.content_calendars for delete to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "content_items_select_member" on public.content_items for select to authenticated
  using (private.is_workspace_member(workspace_id));
create policy "content_items_insert_editor" on public.content_items for insert to authenticated
  with check (
    status <> 'published'
    and private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor'])
  );
create policy "content_items_update_editor" on public.content_items for update to authenticated
  using (
    status <> 'published'
    and private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor'])
  )
  with check (
    status <> 'published'
    and private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor'])
  );
create policy "content_items_delete_admin" on public.content_items for delete to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "assets_select_member" on public.brand_assets for select to authenticated
  using (private.is_workspace_member(workspace_id));
create policy "assets_insert_editor" on public.brand_assets for insert to authenticated
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "assets_update_editor" on public.brand_assets for update to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']))
  with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']));
create policy "assets_delete_admin" on public.brand_assets for delete to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));
create policy "ai_usage_read_admin" on public.ai_usage_events for select to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));
create policy "audit_read_admin" on public.audit_logs for select to authenticated
  using (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_new_auth_user();
