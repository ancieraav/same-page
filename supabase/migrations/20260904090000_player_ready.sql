-- Waiting-room readiness belongs to the player seat, not the operator seat.
alter table public.room_members
  add column if not exists ready boolean not null default false;

create index if not exists room_members_room_ready_idx
  on public.room_members (room_id, ready)
  where left_at is null and is_operator = false;
