alter function private.create_room(text, text, text, text, integer, boolean, boolean, boolean, boolean, boolean, jsonb)
  set search_path = public, private, extensions, pg_temp;
