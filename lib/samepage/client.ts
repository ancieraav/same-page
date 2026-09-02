"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ensureSupabaseUser,
  getSupabaseAccessToken,
  getSupabaseClient,
  getSupabaseError,
} from "@/lib/supabase/client";
import { SamePageError } from "./errors";
import {
  ALLOWED_ATTACHMENT_TYPES,
  answerSchema,
  createRoomSchema,
  MAX_ATTACHMENT_BYTES,
  newQuestionSchema,
  normalizeRoomCode,
  participantNameSchema,
  roomCodeSchema,
  type CreateRoomInput,
} from "./validation";
import type {
  CreatedRoomResult,
  Room,
  RoomActionResult,
  RoomAsset,
  RoomMember,
  RoomQuestion,
  RoomResponse,
  RoomRole,
  RoomState,
} from "./types";

const ATTACHMENT_BUCKET = "room-attachments";

type CreatedRoomRpcPayload = {
  room: Room;
  member: RoomMember;
  roles: RoomRole[];
  questions: RoomQuestion[];
};

type RpcActionPayload = RoomActionResult & {
  next_question_id?: string | null;
};

async function rpc<T>(
  supabase: SupabaseClient,
  functionName: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.rpc(functionName, args);
  if (error) throw getSupabaseError(error);
  return data as T;
}

function mapRoleName(member: RoomMember, roles: RoomRole[]): RoomMember {
  return {
    ...member,
    role_name: member.role_id
      ? roles.find((role) => role.id === member.role_id)?.name ?? null
      : null,
  };
}

function parseOptions(value: unknown): RoomQuestion["options"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((option) => {
    if (!option || typeof option !== "object") return [];
    const candidate = option as { id?: unknown; label?: unknown };
    return typeof candidate.id === "string" && typeof candidate.label === "string"
      ? [{ id: candidate.id, label: candidate.label }]
      : [];
  });
}

function parseQuestion(question: RoomQuestion): RoomQuestion {
  return { ...question, options: parseOptions(question.options) };
}

export function buildRoomHref(path: string, code: string): string {
  const url = new URL(path, window.location.origin);
  url.searchParams.set("code", normalizeRoomCode(code));
  return `${url.pathname}${url.search}`;
}

export function buildJoinUrl(code: string, joinToken: string | null): string {
  const url = new URL("/", window.location.origin);
  url.searchParams.set("code", normalizeRoomCode(code));
  if (joinToken) url.searchParams.set("invite", joinToken);
  return url.toString();
}

export async function createRoom(input: CreateRoomInput): Promise<CreatedRoomResult> {
  const parsed = createRoomSchema.parse(input);
  const user = await ensureSupabaseUser();
  const supabase = await getSupabaseClient();
  const payload = await rpc<CreatedRoomRpcPayload>(supabase, "create_room", {
    p_room_name: parsed.roomName,
    p_topic: parsed.topic,
    p_notes: parsed.notes,
    p_participant_mode: parsed.participantMode,
    p_participant_limit:
      parsed.participantMode === "fixed" ? Number(parsed.participantCount) : null,
    p_use_memes: parsed.useMemes === "yes",
    p_use_roles: parsed.useRoles === "yes",
    p_separate_access: parsed.separateAccess === "yes",
    p_share_responses: parsed.shareResponses === "yes",
    p_anonymous_names: parsed.anonymousNames === "yes",
    p_roles: parsed.useRoles === "yes" ? parsed.roles : [],
  });

  if (payload.member.user_id !== user.id) {
    throw new SamePageError("AUTH_REQUIRED", "The new room session did not match the current participant.");
  }

  return {
    room: payload.room,
    member: mapRoleName(payload.member, payload.roles),
    roles: payload.roles,
    questions: payload.questions.map(parseQuestion),
    joinUrl: buildJoinUrl(payload.room.code, payload.room.join_token),
  };
}

export async function joinRoom({
  code,
  displayName,
  joinToken,
  roleId,
}: {
  code: string;
  displayName: string;
  joinToken?: string | null;
  roleId?: string | null;
}): Promise<RoomState> {
  const normalizedCode = roomCodeSchema.parse(code);
  const normalizedName = participantNameSchema.parse(displayName);
  const supabase = await getSupabaseClient();
  await ensureSupabaseUser();

  await rpc(supabase, "join_room", {
    p_room_code: normalizedCode,
    p_display_name: normalizedName,
    p_join_token: joinToken || null,
    p_role_id: roleId || null,
  });

  return loadRoomState(normalizedCode);
}

export async function leaveRoom(roomId: string): Promise<void> {
  const supabase = await getSupabaseClient();
  await ensureSupabaseUser();
  await rpc(supabase, "leave_room", { p_room_id: roomId });
}

export async function updateMemberRole(roomId: string, roleId: string | null): Promise<void> {
  const supabase = await getSupabaseClient();
  await ensureSupabaseUser();
  await rpc(supabase, "update_member_role", {
    p_room_id: roomId,
    p_role_id: roleId,
  });
}

export async function loadRoomState(code: string): Promise<RoomState> {
  const normalizedCode = roomCodeSchema.parse(code);
  const user = await ensureSupabaseUser();
  const supabase = await getSupabaseClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select(
      "id,code,room_name,topic,notes,status,phase,participant_mode,participant_limit,use_memes,use_roles,separate_access,share_responses,anonymous_names,current_question_id,operator_id,version,created_at,started_at,completed_at",
    )
    .eq("code", normalizedCode)
    .maybeSingle();
  if (roomError) throw getSupabaseError(roomError);
  if (!room) throw new SamePageError("ROOM_NOT_FOUND");

  const [membersResult, rolesResult, questionsResult, responsesResult, assetsResult] =
    await Promise.all([
      supabase
        .from("room_members")
        .select("*")
        .eq("room_id", room.id)
        .is("left_at", null)
        .order("joined_at", { ascending: true }),
      supabase
        .from("room_roles")
        .select("*")
        .eq("room_id", room.id)
        .order("position", { ascending: true }),
      supabase
        .from("questions")
        .select("*")
        .eq("room_id", room.id)
        .is("skipped_at", null)
        .order("ordinal", { ascending: true }),
      supabase
        .from("responses")
        .select("*")
        .eq("room_id", room.id)
        .order("submitted_at", { ascending: true }),
      supabase
        .from("room_assets")
        .select("*")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true }),
    ]);

  for (const result of [
    membersResult,
    rolesResult,
    questionsResult,
    responsesResult,
    assetsResult,
  ]) {
    if (result.error) throw getSupabaseError(result.error);
  }

  const roles = (rolesResult.data ?? []) as RoomRole[];
  const members = (membersResult.data ?? []).map((member) =>
    mapRoleName(member as RoomMember, roles),
  );
  const memberById = new Map(members.map((member) => [member.id, member]));

  return {
    room: room as Room,
    members,
    roles,
    questions: (questionsResult.data ?? []).map((question) =>
      parseQuestion(question as RoomQuestion),
    ),
    responses: (responsesResult.data ?? []).map((response) => ({
      ...(response as RoomResponse),
      member: memberById.get((response as RoomResponse).member_id),
    })),
    assets: (assetsResult.data ?? []) as RoomAsset[],
    currentMember: members.find((member) => member.user_id === user.id) ?? null,
  };
}

export async function subscribeToRoom(
  roomId: string,
  onChange: () => void,
): Promise<() => void> {
  const supabase = await getSupabaseClient();
  const channel = supabase
    .channel(`samepage-room-${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "questions", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "responses", filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function startRoom(code: string): Promise<RoomActionResult> {
  const normalizedCode = roomCodeSchema.parse(code);
  const token = await getSupabaseAccessToken();
  const response = await fetch(`/api/rooms/${encodeURIComponent(normalizedCode)}/start`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "x-samepage-agent-start": "webmcp",
    },
  });
  const payload = (await response.json().catch(() => ({}))) as Partial<RoomActionResult> & {
    code?: string;
    error?: string;
  };
  if (!response.ok) {
    throw new SamePageError(payload.code ?? "START_FAILED", payload.error ?? "The room could not be started.");
  }
  return payload as RoomActionResult;
}

export async function submitResponse({
  roomId,
  questionId,
  answerText,
  optionId,
}: {
  roomId: string;
  questionId: string;
  answerText?: string;
  optionId?: string;
}): Promise<RoomActionResult> {
  const supabase = await getSupabaseClient();
  await ensureSupabaseUser();
  const cleanAnswer = answerText === undefined ? null : answerSchema.parse(answerText);
  return rpc<RpcActionPayload>(supabase, "submit_response", {
    p_room_id: roomId,
    p_question_id: questionId,
    p_answer_text: cleanAnswer,
    p_option_id: optionId ?? null,
  });
}

export async function acknowledgeCompare(
  roomId: string,
  questionId: string,
): Promise<RoomActionResult> {
  const supabase = await getSupabaseClient();
  await ensureSupabaseUser();
  return rpc<RpcActionPayload>(supabase, "acknowledge_compare", {
    p_room_id: roomId,
    p_question_id: questionId,
  });
}

export async function acknowledgeMeme(
  roomId: string,
  questionId: string,
): Promise<RoomActionResult> {
  const supabase = await getSupabaseClient();
  await ensureSupabaseUser();
  return rpc<RpcActionPayload>(supabase, "acknowledge_meme", {
    p_room_id: roomId,
    p_question_id: questionId,
  });
}

export async function addQuestion(roomId: string, prompt: string): Promise<RoomActionResult> {
  const supabase = await getSupabaseClient();
  await ensureSupabaseUser();
  return rpc<RpcActionPayload>(supabase, "add_question", {
    p_room_id: roomId,
    p_prompt: newQuestionSchema.parse(prompt),
  });
}

export async function skipQuestion(roomId: string): Promise<RoomActionResult> {
  const supabase = await getSupabaseClient();
  await ensureSupabaseUser();
  return rpc<RpcActionPayload>(supabase, "skip_question", { p_room_id: roomId });
}

export async function uploadRoomAttachment(roomId: string, file: File): Promise<RoomAsset> {
  await ensureSupabaseUser();
  const supabase = await getSupabaseClient();

  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new SamePageError("ATTACHMENT_TOO_LARGE", "Attachments must be 10 MB or smaller.");
  }
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number])) {
    throw new SamePageError(
      "ATTACHMENT_TYPE_NOT_ALLOWED",
      "Use a PDF, text, JSON, PNG, JPG, or WebP attachment.",
    );
  }

  const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-").slice(-120) || "attachment";
  const storagePath = `${roomId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw getSupabaseError(uploadError);

  try {
    return await rpc<RoomAsset>(supabase, "add_room_asset", {
      p_room_id: roomId,
      p_storage_path: storagePath,
      p_file_name: file.name,
      p_content_type: file.type,
      p_size_bytes: file.size,
    });
  } catch (error) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([storagePath]);
    throw error;
  }
}

export async function createAttachmentUrl(storagePath: string): Promise<string> {
  await ensureSupabaseUser();
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(storagePath, 60 * 10);
  if (error || !data?.signedUrl) throw getSupabaseError(error);
  return data.signedUrl;
}

export function getRoomCodeFromLocation(): string {
  if (typeof window === "undefined") return "";
  return normalizeRoomCode(new URLSearchParams(window.location.search).get("code") ?? "");
}

export function getInviteTokenFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("invite");
}

export function isRoomCodeComplete(value: string): boolean {
  return /^[A-Z0-9]{7}$/.test(normalizeRoomCode(value));
}
