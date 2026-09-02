create or replace function private.create_room(
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
set search_path = public, private, extensions, pg_temp
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

grant execute on function private.create_room(text, text, text, text, integer, boolean, boolean, boolean, boolean, boolean, jsonb) to authenticated;
