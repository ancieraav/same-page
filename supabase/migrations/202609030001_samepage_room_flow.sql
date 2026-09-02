create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{7}$'),
  join_token text unique,
  room_name text not null check (char_length(trim(room_name)) between 2 and 80),
  topic text not null check (char_length(trim(topic)) between 2 and 160),
  notes text not null default '' check (char_length(notes) <= 4000),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'completed')),
  phase text not null default 'waiting' check (phase in ('waiting', 'answer', 'compare', 'meme', 'add_question', 'summary')),
  participant_mode text not null check (participant_mode in ('flexible', 'fixed')),
  participant_limit integer check (participant_limit is null or participant_limit between 2 and 100),
  use_memes boolean not null default false,
  use_roles boolean not null default false,
  separate_access boolean not null default false,
  share_responses boolean not null default false,
  anonymous_names boolean not null default true,
  current_question_id uuid,
  operator_id uuid not null references auth.users(id) on delete restrict,
  version bigint not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  started_at timestamptz,
  completed_at timestamptz,
  check (
    (participant_mode = 'flexible' and participant_limit is null)
    or (participant_mode = 'fixed' and participant_limit is not null)
  ),
  check (share_responses or anonymous_names)
);

create table if not exists public.room_roles (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  position integer not null default 0 check (position >= 0),
  unique (room_id, name),
  unique (room_id, position)
);

create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  member_type text not null default 'participant' check (member_type in ('operator', 'participant')),
  role_id uuid references public.room_roles(id) on delete set null,
  joined_at timestamptz not null default timezone('utc', now()),
  left_at timestamptz,
  last_seen_at timestamptz not null default timezone('utc', now()),
  unique (room_id, user_id)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  ordinal integer not null check (ordinal > 0),
  kind text not null check (kind in ('text', 'choice')),
  prompt text not null check (char_length(trim(prompt)) between 5 and 400),
  options jsonb not null default '[]'::jsonb,
  is_system boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  skipped_at timestamptz,
  unique (room_id, ordinal),
  check ((kind = 'text' and jsonb_array_length(options) = 0) or kind = 'choice')
);

alter table public.rooms
  drop constraint if exists rooms_current_question_id_fkey;

alter table public.rooms
  add constraint rooms_current_question_id_fkey
  foreign key (current_question_id) references public.questions(id) on delete set null;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  member_id uuid not null references public.room_members(id) on delete cascade,
  answer_text text check (answer_text is null or char_length(answer_text) <= 4000),
  option_id text,
  submitted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (question_id, member_id),
  check (answer_text is not null or option_id is not null)
);

create table if not exists public.room_member_progress (
  room_id uuid not null references public.rooms(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  member_id uuid not null references public.room_members(id) on delete cascade,
  stage text not null check (stage in ('submitted', 'compare', 'choice', 'meme')),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (question_id, member_id)
);

create table if not exists public.room_assets (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(trim(file_name)) between 1 and 180),
  content_type text not null check (char_length(content_type) between 1 and 120),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.room_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_rooms_operator_id on public.rooms(operator_id);
create index if not exists idx_rooms_status on public.rooms(status);
create index if not exists idx_room_roles_room_id on public.room_roles(room_id);
create index if not exists idx_room_members_room_id on public.room_members(room_id);
create index if not exists idx_room_members_user_id on public.room_members(user_id);
create index if not exists idx_questions_room_ordinal on public.questions(room_id, ordinal);
create index if not exists idx_responses_room_question on public.responses(room_id, question_id);
create index if not exists idx_progress_room_question on public.room_member_progress(room_id, question_id);
create index if not exists idx_assets_room_id on public.room_assets(room_id);
create index if not exists idx_events_room_created on public.room_events(room_id, created_at desc);

create or replace function private.is_room_member(
  p_room_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select p_user_id is not null
    and exists (
      select 1
      from public.room_members
      where room_id = p_room_id
        and user_id = p_user_id
        and left_at is null
    );
$$;

create or replace function private.is_room_operator(
  p_room_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select p_user_id is not null
    and exists (
      select 1
      from public.room_members
      where room_id = p_room_id
        and user_id = p_user_id
        and member_type = 'operator'
        and left_at is null
    );
$$;

create or replace function private.can_edit_room(
  p_room_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select private.is_room_operator(p_room_id, p_user_id)
    or exists (
      select 1
      from public.room_members member
      join public.room_roles role on role.id = member.role_id
      where member.room_id = p_room_id
        and member.user_id = p_user_id
        and member.left_at is null
        and role.name = 'Source of truth'
    );
$$;

create or replace function private.can_view_response(
  p_room_id uuid,
  p_member_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select private.is_room_operator(p_room_id, p_user_id)
    or exists (
      select 1
      from public.room_members member
      join public.rooms room on room.id = member.room_id
      where member.id = p_member_id
        and member.room_id = p_room_id
        and member.user_id = p_user_id
    )
    or exists (
      select 1
      from public.rooms room
      where room.id = p_room_id
        and room.share_responses
        and private.is_room_member(room.id, p_user_id)
    );
$$;

grant execute on function private.is_room_member(uuid, uuid) to authenticated;
grant execute on function private.is_room_operator(uuid, uuid) to authenticated;
grant execute on function private.can_edit_room(uuid, uuid) to authenticated;
grant execute on function private.can_view_response(uuid, uuid, uuid) to authenticated;

alter table public.rooms enable row level security;
alter table public.room_roles enable row level security;
alter table public.room_members enable row level security;
alter table public.questions enable row level security;
alter table public.responses enable row level security;
alter table public.room_member_progress enable row level security;
alter table public.room_assets enable row level security;
alter table public.room_events enable row level security;

drop policy if exists rooms_member_select on public.rooms;
create policy rooms_member_select on public.rooms
  for select to authenticated
  using (private.is_room_member(id));

drop policy if exists room_roles_member_select on public.room_roles;
create policy room_roles_member_select on public.room_roles
  for select to authenticated
  using (private.is_room_member(room_id));

drop policy if exists room_members_member_select on public.room_members;
create policy room_members_member_select on public.room_members
  for select to authenticated
  using (private.is_room_member(room_id));

drop policy if exists questions_member_select on public.questions;
create policy questions_member_select on public.questions
  for select to authenticated
  using (private.is_room_member(room_id));

drop policy if exists responses_member_select on public.responses;
create policy responses_member_select on public.responses
  for select to authenticated
  using (private.can_view_response(room_id, member_id));

drop policy if exists progress_member_select on public.room_member_progress;
create policy progress_member_select on public.room_member_progress
  for select to authenticated
  using (private.is_room_member(room_id));

drop policy if exists assets_member_select on public.room_assets;
create policy assets_member_select on public.room_assets
  for select to authenticated
  using (private.is_room_member(room_id));

drop policy if exists events_operator_select on public.room_events;
create policy events_operator_select on public.room_events
  for select to authenticated
  using (private.is_room_operator(room_id));

grant select on public.rooms to authenticated;
grant select on public.room_roles to authenticated;
grant select on public.room_members to authenticated;
grant select on public.questions to authenticated;
grant select on public.responses to authenticated;
grant select on public.room_member_progress to authenticated;
grant select on public.room_assets to authenticated;
grant select on public.room_events to authenticated;

create or replace function private.room_snapshot(
  p_room_id uuid,
  p_user_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select jsonb_build_object(
    'room', (select to_jsonb(room) - 'join_token' from public.rooms room where room.id = p_room_id),
    'member', (select to_jsonb(member) from public.room_members member where member.room_id = p_room_id and member.user_id = p_user_id and member.left_at is null),
    'roles', coalesce((select jsonb_agg(to_jsonb(role) order by role.position) from public.room_roles role where role.room_id = p_room_id), '[]'::jsonb),
    'questions', coalesce((select jsonb_agg(to_jsonb(question) order by question.ordinal) from public.questions question where question.room_id = p_room_id and question.skipped_at is null), '[]'::jsonb)
  );
$$;

create or replace function public.create_room(
  p_room_name text,
  p_topic text,
  p_notes text default '',
  p_participant_mode text default 'flexible',
  p_participant_limit integer default null,
  p_use_memes boolean default false,
  p_use_roles boolean default false,
  p_separate_access boolean default false,
  p_share_responses boolean default false,
  p_anonymous_names boolean default true,
  p_roles jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room_id uuid;
  v_question_id uuid;
  v_code text;
  v_join_token text;
  v_position integer;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if char_length(trim(coalesce(p_room_name, ''))) not between 2 and 80 then
    raise exception 'INVALID_ROOM_NAME';
  end if;
  if char_length(trim(coalesce(p_topic, ''))) not between 2 and 160 then
    raise exception 'INVALID_TOPIC';
  end if;
  if p_participant_mode not in ('flexible', 'fixed') then
    raise exception 'INVALID_PARTICIPANT_MODE';
  end if;
  if p_participant_mode = 'fixed' and (p_participant_limit is null or p_participant_limit not between 2 and 100) then
    raise exception 'INVALID_PARTICIPANT_LIMIT';
  end if;
  if p_participant_mode = 'flexible' and p_participant_limit is not null then
    raise exception 'INVALID_PARTICIPANT_LIMIT';
  end if;
  if p_use_roles and jsonb_array_length(coalesce(p_roles, '[]'::jsonb)) = 0 then
    raise exception 'INVALID_ROLES';
  end if;
  if not p_share_responses and not p_anonymous_names then
    raise exception 'INVALID_ANONYMITY';
  end if;

  v_join_token := case when p_separate_access then replace(gen_random_uuid()::text, '-', '') else null end;

  loop
    v_code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 7));
    begin
      insert into public.rooms (
        code,
        join_token,
        room_name,
        topic,
        notes,
        participant_mode,
        participant_limit,
        use_memes,
        use_roles,
        separate_access,
        share_responses,
        anonymous_names,
        operator_id
      ) values (
        v_code,
        v_join_token,
        trim(p_room_name),
        trim(p_topic),
        trim(coalesce(p_notes, '')),
        p_participant_mode,
        p_participant_limit,
        coalesce(p_use_memes, false),
        coalesce(p_use_roles, false),
        coalesce(p_separate_access, false),
        coalesce(p_share_responses, false),
        coalesce(p_anonymous_names, true),
        v_user_id
      ) returning id into v_room_id;
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  insert into public.room_members (room_id, user_id, display_name, member_type)
  values (v_room_id, v_user_id, 'Operator', 'operator');

  v_position := 0;
  for v_code in
    select trim(value)
    from jsonb_array_elements_text(coalesce(p_roles, '[]'::jsonb)) value
    where char_length(trim(value)) > 0
  loop
    insert into public.room_roles (room_id, name, position)
    values (v_room_id, v_code, v_position)
    on conflict (room_id, name) do nothing;
    v_position := v_position + 1;
  end loop;

  insert into public.questions (room_id, ordinal, kind, prompt, is_system, created_by)
  values (
    v_room_id,
    1,
    'text',
    'What should everyone understand the same way before we move forward?',
    true,
    v_user_id
  ) returning id into v_question_id;

  update public.rooms
  set current_question_id = v_question_id
  where id = v_room_id;

  insert into public.questions (room_id, ordinal, kind, prompt, options, is_system, created_by)
  values (
    v_room_id,
    2,
    'choice',
    'Which direction feels most useful for the team?',
    jsonb_build_array(
      jsonb_build_object('id', 'make-outcome-visible', 'label', 'Make the outcome visible'),
      jsonb_build_object('id', 'start-with-decision', 'label', 'Start with the decision'),
      jsonb_build_object('id', 'shared-definition', 'label', 'Create a shared definition'),
      jsonb_build_object('id', 'next-step', 'label', 'Agree on the next step')
    ),
    true,
    v_user_id
  );

  insert into public.room_events (room_id, actor_id, event_type, payload)
  values (v_room_id, v_user_id, 'room_created', jsonb_build_object('code', v_code));

  return jsonb_set(
    private.room_snapshot(v_room_id, v_user_id),
    '{room,join_token}',
    coalesce(to_jsonb(v_join_token), 'null'::jsonb),
    true
  );
end;
$$;

create or replace function public.join_room(
  p_room_code text,
  p_display_name text,
  p_join_token text default null,
  p_role_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms%rowtype;
  v_member public.room_members%rowtype;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if char_length(trim(coalesce(p_display_name, ''))) not between 1 and 60 then
    raise exception 'INVALID_DISPLAY_NAME';
  end if;

  select * into v_room
  from public.rooms
  where code = upper(trim(coalesce(p_room_code, '')))
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;
  if v_room.separate_access and (p_join_token is null or p_join_token <> v_room.join_token) then
    raise exception 'JOIN_LINK_REQUIRED';
  end if;
  if v_room.status <> 'waiting' then
    raise exception 'ROOM_STARTED';
  end if;

  if p_role_id is not null and not exists (
    select 1 from public.room_roles where id = p_role_id and room_id = v_room.id
  ) then
    raise exception 'INVALID_ROLE';
  end if;

  select * into v_member
  from public.room_members
  where room_id = v_room.id and user_id = v_user_id and left_at is null;

  if found then
    update public.room_members
    set display_name = trim(p_display_name),
        role_id = coalesce(p_role_id, role_id),
        last_seen_at = timezone('utc', now())
    where id = v_member.id;
  else
    select count(*) into v_count
    from public.room_members
    where room_id = v_room.id and left_at is null;

    if v_room.participant_mode = 'fixed' and v_count >= v_room.participant_limit then
      raise exception 'ROOM_FULL';
    end if;

    insert into public.room_members (room_id, user_id, display_name, role_id)
    values (v_room.id, v_user_id, trim(p_display_name), p_role_id)
    returning * into v_member;

    insert into public.room_events (room_id, actor_id, event_type, payload)
    values (v_room.id, v_user_id, 'member_joined', jsonb_build_object('member_id', v_member.id));
  end if;

  return private.room_snapshot(v_room.id, v_user_id);
end;
$$;

create or replace function public.leave_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_member public.room_members%rowtype;
begin
  select * into v_member
  from public.room_members
  where room_id = p_room_id and user_id = v_user_id and left_at is null;
  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  update public.room_members
  set left_at = timezone('utc', now()), last_seen_at = timezone('utc', now())
  where id = v_member.id;

  if v_member.member_type = 'operator' then
    update public.rooms
    set status = 'completed', phase = 'summary', completed_at = timezone('utc', now()), version = version + 1
    where id = p_room_id and status <> 'completed';
  end if;

  insert into public.room_events (room_id, actor_id, event_type, payload)
  values (p_room_id, v_user_id, 'member_left', jsonb_build_object('member_id', v_member.id));

  return jsonb_build_object('ok', true, 'room_id', p_room_id);
end;
$$;

create or replace function public.update_member_role(
  p_room_id uuid,
  p_role_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if not private.is_room_member(p_room_id, v_user_id) then
    raise exception 'ROOM_NOT_FOUND';
  end if;
  if exists (select 1 from public.rooms where id = p_room_id and status <> 'waiting') then
    raise exception 'ROOM_STARTED';
  end if;
  if p_role_id is not null and not exists (
    select 1 from public.room_roles where id = p_role_id and room_id = p_room_id
  ) then
    raise exception 'INVALID_ROLE';
  end if;

  update public.room_members
  set role_id = p_role_id, last_seen_at = timezone('utc', now())
  where room_id = p_room_id and user_id = v_user_id and left_at is null;

  return jsonb_build_object('ok', true, 'room_id', p_room_id);
end;
$$;

create or replace function public.start_room(
  p_room_code text,
  p_operator_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_room public.rooms%rowtype;
  v_count integer;
begin
  if auth.uid() is null or p_operator_id <> auth.uid() then
    raise exception 'OPERATOR_REQUIRED';
  end if;
  if p_operator_id is null then
    raise exception 'OPERATOR_REQUIRED';
  end if;

  select * into v_room
  from public.rooms
  where code = upper(trim(coalesce(p_room_code, '')))
  for update;
  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;
  if not exists (
    select 1 from public.room_members
    where room_id = v_room.id and user_id = p_operator_id and member_type = 'operator' and left_at is null
  ) then
    raise exception 'OPERATOR_REQUIRED';
  end if;
  if v_room.status = 'active' then
    return jsonb_build_object(
      'ok', true,
      'room_code', v_room.code,
      'room_id', v_room.id,
      'status', v_room.status,
      'phase', v_room.phase,
      'current_question_id', v_room.current_question_id,
      'message', 'Room is already active.'
    );
  end if;
  if v_room.status = 'completed' then
    raise exception 'ROOM_STARTED';
  end if;

  select count(*) into v_count
  from public.room_members
  where room_id = v_room.id and left_at is null;

  if v_room.participant_mode = 'fixed' and v_count <> v_room.participant_limit then
    raise exception 'ROOM_NOT_READY';
  end if;
  if v_room.participant_mode = 'flexible' and v_count < 2 then
    raise exception 'ROOM_NOT_READY';
  end if;

  update public.rooms
  set status = 'active', phase = 'answer', started_at = timezone('utc', now()), version = version + 1
  where id = v_room.id;

  insert into public.room_events (room_id, actor_id, event_type, payload)
  values (v_room.id, p_operator_id, 'room_started', jsonb_build_object('agent_started', true));

  return jsonb_build_object(
    'ok', true,
    'room_code', v_room.code,
    'room_id', v_room.id,
    'status', 'active',
    'phase', 'answer',
    'current_question_id', v_room.current_question_id,
    'message', 'Room started.'
  );
end;
$$;

create or replace function public.submit_response(
  p_room_id uuid,
  p_question_id uuid,
  p_answer_text text default null,
  p_option_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms%rowtype;
  v_question public.questions%rowtype;
  v_member public.room_members%rowtype;
  v_member_count integer;
  v_response_count integer;
  v_next_question public.questions%rowtype;
  v_stage text;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.status <> 'active' then raise exception 'ROOM_NOT_ACTIVE'; end if;
  if v_room.current_question_id <> p_question_id then raise exception 'STALE_QUESTION'; end if;

  select * into v_member
  from public.room_members
  where room_id = p_room_id and user_id = v_user_id and left_at is null;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;

  select * into v_question from public.questions where id = p_question_id and room_id = p_room_id and skipped_at is null;
  if not found then raise exception 'STALE_QUESTION'; end if;

  if v_question.kind = 'text' then
    if char_length(trim(coalesce(p_answer_text, ''))) < 1 then raise exception 'RESPONSE_REQUIRED'; end if;
    if char_length(p_answer_text) > 4000 then raise exception 'RESPONSE_TOO_LONG'; end if;
    v_stage := 'submitted';
  else
    if p_option_id is null or not exists (
      select 1 from jsonb_array_elements(v_question.options) option where option->>'id' = p_option_id
    ) then raise exception 'INVALID_OPTION'; end if;
    v_stage := 'choice';
  end if;

  insert into public.responses (room_id, question_id, member_id, answer_text, option_id)
  values (p_room_id, p_question_id, v_member.id, nullif(trim(p_answer_text), ''), p_option_id)
  on conflict (question_id, member_id) do update
  set answer_text = excluded.answer_text,
      option_id = excluded.option_id,
      updated_at = timezone('utc', now());

  insert into public.room_member_progress (room_id, question_id, member_id, stage)
  values (p_room_id, p_question_id, v_member.id, v_stage)
  on conflict (question_id, member_id) do update
  set stage = excluded.stage, updated_at = timezone('utc', now());

  select count(*) into v_member_count
  from public.room_members
  where room_id = p_room_id and left_at is null;
  select count(*) into v_response_count
  from public.responses response
  join public.room_members member on member.id = response.member_id and member.left_at is null
  where response.question_id = p_question_id;

  if v_response_count >= v_member_count and v_member_count > 0 then
    if v_question.kind = 'text' and v_room.share_responses then
      update public.rooms set phase = 'compare', version = version + 1 where id = p_room_id;
    elsif v_question.kind = 'text' then
      select * into v_next_question
      from public.questions question
      where question.room_id = p_room_id and question.ordinal > v_question.ordinal and question.skipped_at is null
      order by question.ordinal asc limit 1;
      if found then
        update public.rooms set current_question_id = v_next_question.id, phase = 'answer', version = version + 1 where id = p_room_id;
      else
        update public.rooms set phase = 'add_question', version = version + 1 where id = p_room_id;
      end if;
    else
      update public.rooms
      set phase = case when v_room.use_memes then 'meme' else 'add_question' end,
          version = version + 1
      where id = p_room_id;
    end if;
  end if;

  insert into public.room_events (room_id, actor_id, event_type, payload)
  values (p_room_id, v_user_id, 'response_submitted', jsonb_build_object('question_id', p_question_id));

  select * into v_room from public.rooms where id = p_room_id;
  return jsonb_build_object(
    'ok', true,
    'room_code', v_room.code,
    'room_id', v_room.id,
    'status', v_room.status,
    'phase', v_room.phase,
    'current_question_id', v_room.current_question_id,
    'message', case when v_response_count >= v_member_count then 'Everyone has responded.' else 'Response saved.' end
  );
end;
$$;

create or replace function public.acknowledge_compare(
  p_room_id uuid,
  p_question_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms%rowtype;
  v_member public.room_members%rowtype;
  v_question public.questions%rowtype;
  v_member_count integer;
  v_ack_count integer;
  v_next_question public.questions%rowtype;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.phase <> 'compare' or v_room.current_question_id <> p_question_id then raise exception 'STALE_QUESTION'; end if;
  select * into v_member from public.room_members where room_id = p_room_id and user_id = v_user_id and left_at is null;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  select * into v_question from public.questions where id = p_question_id and room_id = p_room_id;

  insert into public.room_member_progress (room_id, question_id, member_id, stage)
  values (p_room_id, p_question_id, v_member.id, 'compare')
  on conflict (question_id, member_id) do update
  set stage = 'compare', updated_at = timezone('utc', now());

  select count(*) into v_member_count from public.room_members where room_id = p_room_id and left_at is null;
  select count(*) into v_ack_count
  from public.room_member_progress progress
  join public.room_members member on member.id = progress.member_id and member.left_at is null
  where progress.question_id = p_question_id and progress.stage = 'compare';

  if v_ack_count >= v_member_count and v_member_count > 0 then
    select * into v_next_question
    from public.questions question
    where question.room_id = p_room_id and question.ordinal > v_question.ordinal and question.skipped_at is null
    order by question.ordinal asc limit 1;
    if found then
      update public.rooms set current_question_id = v_next_question.id, phase = 'answer', version = version + 1 where id = p_room_id;
    else
      update public.rooms set phase = 'add_question', version = version + 1 where id = p_room_id;
    end if;
  end if;

  select * into v_room from public.rooms where id = p_room_id;
  return jsonb_build_object(
    'ok', true,
    'room_code', v_room.code,
    'room_id', v_room.id,
    'status', v_room.status,
    'phase', v_room.phase,
    'current_question_id', v_room.current_question_id,
    'message', case when v_ack_count >= v_member_count then 'The room moved to the next question.' else 'Comparison marked as seen.' end
  );
end;
$$;

create or replace function public.acknowledge_meme(
  p_room_id uuid,
  p_question_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms%rowtype;
  v_member public.room_members%rowtype;
  v_member_count integer;
  v_ack_count integer;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.phase <> 'meme' then raise exception 'STALE_QUESTION'; end if;
  select * into v_member from public.room_members where room_id = p_room_id and user_id = v_user_id and left_at is null;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;

  insert into public.room_member_progress (room_id, question_id, member_id, stage)
  values (p_room_id, p_question_id, v_member.id, 'meme')
  on conflict (question_id, member_id) do update
  set stage = 'meme', updated_at = timezone('utc', now());

  select count(*) into v_member_count from public.room_members where room_id = p_room_id and left_at is null;
  select count(*) into v_ack_count
  from public.room_member_progress progress
  join public.room_members member on member.id = progress.member_id and member.left_at is null
  where progress.question_id = p_question_id and progress.stage = 'meme';

  if v_ack_count >= v_member_count and v_member_count > 0 then
    update public.rooms set phase = 'add_question', version = version + 1 where id = p_room_id;
  end if;

  select * into v_room from public.rooms where id = p_room_id;
  return jsonb_build_object(
    'ok', true,
    'room_code', v_room.code,
    'room_id', v_room.id,
    'status', v_room.status,
    'phase', v_room.phase,
    'current_question_id', v_room.current_question_id,
    'message', case when v_ack_count >= v_member_count then 'Meme break complete.' else 'Meme marked as seen.' end
  );
end;
$$;

create or replace function public.add_question(
  p_room_id uuid,
  p_prompt text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_question_id uuid;
  v_room public.rooms%rowtype;
  v_ordinal integer;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if not private.can_edit_room(p_room_id, v_user_id) then raise exception 'OPERATOR_CONTROLS_REQUIRED'; end if;
  if v_room.phase <> 'add_question' then raise exception 'RESPONSE_NOT_ALLOWED'; end if;
  if char_length(trim(coalesce(p_prompt, ''))) not between 5 and 400 then raise exception 'INVALID_QUESTION'; end if;

  select coalesce(max(ordinal), 0) + 1 into v_ordinal from public.questions where room_id = p_room_id;
  insert into public.questions (room_id, ordinal, kind, prompt, is_system, created_by)
  values (p_room_id, v_ordinal, 'text', trim(p_prompt), false, v_user_id)
  returning id into v_question_id;

  update public.rooms
  set current_question_id = v_question_id, phase = 'answer', status = 'active', version = version + 1
  where id = p_room_id;

  insert into public.room_events (room_id, actor_id, event_type, payload)
  values (p_room_id, v_user_id, 'question_added', jsonb_build_object('question_id', v_question_id));

  select * into v_room from public.rooms where id = p_room_id;
  return jsonb_build_object(
    'ok', true,
    'room_code', v_room.code,
    'room_id', v_room.id,
    'status', v_room.status,
    'phase', v_room.phase,
    'current_question_id', v_room.current_question_id,
    'message', 'Question added.'
  );
end;
$$;

create or replace function public.skip_question(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms%rowtype;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if not private.can_edit_room(p_room_id, v_user_id) then raise exception 'OPERATOR_CONTROLS_REQUIRED'; end if;
  if v_room.phase <> 'add_question' then raise exception 'RESPONSE_NOT_ALLOWED'; end if;

  update public.rooms
  set status = 'completed', phase = 'summary', completed_at = timezone('utc', now()), version = version + 1
  where id = p_room_id;

  insert into public.room_events (room_id, actor_id, event_type)
  values (p_room_id, v_user_id, 'room_completed');

  return jsonb_build_object(
    'ok', true,
    'room_code', v_room.code,
    'room_id', v_room.id,
    'status', 'completed',
    'phase', 'summary',
    'current_question_id', v_room.current_question_id,
    'message', 'Room completed.'
  );
end;
$$;

create or replace function public.add_room_asset(
  p_room_id uuid,
  p_storage_path text,
  p_file_name text,
  p_content_type text,
  p_size_bytes bigint
)
returns public.room_assets
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_asset public.room_assets%rowtype;
begin
  if not private.is_room_operator(p_room_id, v_user_id) then raise exception 'OPERATOR_REQUIRED'; end if;
  if p_size_bytes not between 1 and 10485760 then raise exception 'ATTACHMENT_TOO_LARGE'; end if;
  insert into public.room_assets (room_id, storage_path, file_name, content_type, size_bytes, created_by)
  values (p_room_id, p_storage_path, p_file_name, p_content_type, p_size_bytes, v_user_id)
  returning * into v_asset;
  return v_asset;
end;
$$;

revoke all on function public.create_room(text, text, text, text, integer, boolean, boolean, boolean, boolean, boolean, jsonb) from public, anon;
grant execute on function public.create_room(text, text, text, text, integer, boolean, boolean, boolean, boolean, boolean, jsonb) to authenticated;
revoke all on function public.join_room(text, text, text, uuid) from public, anon;
grant execute on function public.join_room(text, text, text, uuid) to authenticated;
revoke all on function public.leave_room(uuid) from public, anon;
grant execute on function public.leave_room(uuid) to authenticated;
revoke all on function public.update_member_role(uuid, uuid) from public, anon;
grant execute on function public.update_member_role(uuid, uuid) to authenticated;
revoke all on function public.start_room(text, uuid) from public, anon;
grant execute on function public.start_room(text, uuid) to authenticated;
revoke all on function public.submit_response(uuid, uuid, text, text) from public, anon;
grant execute on function public.submit_response(uuid, uuid, text, text) to authenticated;
revoke all on function public.acknowledge_compare(uuid, uuid) from public, anon;
grant execute on function public.acknowledge_compare(uuid, uuid) to authenticated;
revoke all on function public.acknowledge_meme(uuid, uuid) from public, anon;
grant execute on function public.acknowledge_meme(uuid, uuid) to authenticated;
revoke all on function public.add_question(uuid, text) from public, anon;
grant execute on function public.add_question(uuid, text) to authenticated;
revoke all on function public.skip_question(uuid) from public, anon;
grant execute on function public.skip_question(uuid) to authenticated;
revoke all on function public.add_room_asset(uuid, text, text, text, bigint) from public, anon;
grant execute on function public.add_room_asset(uuid, text, text, text, bigint) to authenticated;

insert into storage.buckets (id, name, public)
values ('room-attachments', 'room-attachments', false)
on conflict (id) do update set public = false;

drop policy if exists room_attachments_operator_insert on storage.objects;
create policy room_attachments_operator_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'room-attachments'
    and private.is_room_operator(
      case
        when (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' then (storage.foldername(name))[1]::uuid
        else null
      end
    )
  );

drop policy if exists room_attachments_member_select on storage.objects;
create policy room_attachments_member_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'room-attachments'
    and private.is_room_member(
      case
        when (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' then (storage.foldername(name))[1]::uuid
        else null
      end
    )
  );

drop policy if exists room_attachments_operator_delete on storage.objects;
create policy room_attachments_operator_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'room-attachments'
    and private.is_room_operator(
      case
        when (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' then (storage.foldername(name))[1]::uuid
        else null
      end
    )
  );

do $$
begin
  alter publication supabase_realtime add table
    public.rooms,
    public.room_roles,
    public.room_members,
    public.questions,
    public.responses,
    public.room_member_progress,
    public.room_assets;
exception when duplicate_object then
  null;
end;
$$;
