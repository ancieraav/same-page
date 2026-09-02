create index if not exists idx_questions_created_by on public.questions(created_by);
create index if not exists idx_responses_member_id on public.responses(member_id);
create index if not exists idx_assets_created_by on public.room_assets(created_by);
create index if not exists idx_events_actor_id on public.room_events(actor_id);
create index if not exists idx_progress_member_id on public.room_member_progress(member_id);
create index if not exists idx_room_members_role_id on public.room_members(role_id);
create index if not exists idx_rooms_current_question_id on public.rooms(current_question_id);

alter function public.create_room(text, text, text, text, integer, boolean, boolean, boolean, boolean, boolean, jsonb) set schema private;
alter function public.join_room(text, text, text, uuid) set schema private;
alter function public.leave_room(uuid) set schema private;
alter function public.update_member_role(uuid, uuid) set schema private;
alter function public.start_room(text, uuid) set schema private;
alter function public.submit_response(uuid, uuid, text, text) set schema private;
alter function public.acknowledge_compare(uuid, uuid) set schema private;
alter function public.acknowledge_meme(uuid, uuid) set schema private;
alter function public.add_question(uuid, text) set schema private;
alter function public.skip_question(uuid) set schema private;
alter function public.add_room_asset(uuid, text, text, text, bigint) set schema private;

grant execute on function private.create_room(text, text, text, text, integer, boolean, boolean, boolean, boolean, boolean, jsonb) to authenticated;
grant execute on function private.join_room(text, text, text, uuid) to authenticated;
grant execute on function private.leave_room(uuid) to authenticated;
grant execute on function private.update_member_role(uuid, uuid) to authenticated;
grant execute on function private.start_room(text, uuid) to authenticated;
grant execute on function private.submit_response(uuid, uuid, text, text) to authenticated;
grant execute on function private.acknowledge_compare(uuid, uuid) to authenticated;
grant execute on function private.acknowledge_meme(uuid, uuid) to authenticated;
grant execute on function private.add_question(uuid, text) to authenticated;
grant execute on function private.skip_question(uuid) to authenticated;
grant execute on function private.add_room_asset(uuid, text, text, text, bigint) to authenticated;

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
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.create_room(
    p_room_name,
    p_topic,
    p_notes,
    p_participant_mode,
    p_participant_limit,
    p_use_memes,
    p_use_roles,
    p_separate_access,
    p_share_responses,
    p_anonymous_names,
    p_roles
  );
$$;

create or replace function public.join_room(
  p_room_code text,
  p_display_name text,
  p_join_token text default null,
  p_role_id uuid default null
)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.join_room(p_room_code, p_display_name, p_join_token, p_role_id);
$$;

create or replace function public.leave_room(p_room_id uuid)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.leave_room(p_room_id);
$$;

create or replace function public.update_member_role(p_room_id uuid, p_role_id uuid default null)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.update_member_role(p_room_id, p_role_id);
$$;

create or replace function public.start_room(p_room_code text, p_operator_id uuid)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.start_room(p_room_code, p_operator_id);
$$;

create or replace function public.submit_response(
  p_room_id uuid,
  p_question_id uuid,
  p_answer_text text default null,
  p_option_id text default null
)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.submit_response(p_room_id, p_question_id, p_answer_text, p_option_id);
$$;

create or replace function public.acknowledge_compare(p_room_id uuid, p_question_id uuid)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.acknowledge_compare(p_room_id, p_question_id);
$$;

create or replace function public.acknowledge_meme(p_room_id uuid, p_question_id uuid)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.acknowledge_meme(p_room_id, p_question_id);
$$;

create or replace function public.add_question(p_room_id uuid, p_prompt text)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.add_question(p_room_id, p_prompt);
$$;

create or replace function public.skip_question(p_room_id uuid)
returns jsonb
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.skip_question(p_room_id);
$$;

create or replace function public.add_room_asset(
  p_room_id uuid,
  p_storage_path text,
  p_file_name text,
  p_content_type text,
  p_size_bytes bigint
)
returns public.room_assets
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.add_room_asset(p_room_id, p_storage_path, p_file_name, p_content_type, p_size_bytes);
$$;

revoke all on function public.create_room(text, text, text, text, integer, boolean, boolean, boolean, boolean, boolean, jsonb) from public, anon;
revoke all on function public.join_room(text, text, text, uuid) from public, anon;
revoke all on function public.leave_room(uuid) from public, anon;
revoke all on function public.update_member_role(uuid, uuid) from public, anon;
revoke all on function public.start_room(text, uuid) from public, anon;
revoke all on function public.submit_response(uuid, uuid, text, text) from public, anon;
revoke all on function public.acknowledge_compare(uuid, uuid) from public, anon;
revoke all on function public.acknowledge_meme(uuid, uuid) from public, anon;
revoke all on function public.add_question(uuid, text) from public, anon;
revoke all on function public.skip_question(uuid) from public, anon;
revoke all on function public.add_room_asset(uuid, text, text, text, bigint) from public, anon;

grant execute on function public.create_room(text, text, text, text, integer, boolean, boolean, boolean, boolean, boolean, jsonb) to authenticated;
grant execute on function public.join_room(text, text, text, uuid) to authenticated;
grant execute on function public.leave_room(uuid) to authenticated;
grant execute on function public.update_member_role(uuid, uuid) to authenticated;
grant execute on function public.start_room(text, uuid) to authenticated;
grant execute on function public.submit_response(uuid, uuid, text, text) to authenticated;
grant execute on function public.acknowledge_compare(uuid, uuid) to authenticated;
grant execute on function public.acknowledge_meme(uuid, uuid) to authenticated;
grant execute on function public.add_question(uuid, text) to authenticated;
grant execute on function public.skip_question(uuid) to authenticated;
grant execute on function public.add_room_asset(uuid, text, text, text, bigint) to authenticated;
