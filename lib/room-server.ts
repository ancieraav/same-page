import type {
  RoomComparison,
  RoomFile,
  RoomPlayer,
  RoomQuestion,
  RoomSnapshot,
  RoomStatus,
} from "./room-types";
import { getRuntimeEnv } from "./runtime-env";

type RoomRow = {
  id: string;
  title: string;
  context: string;
  player_count: number;
  timer_minutes: number;
  meme_enabled: number | boolean;
  status: string;
  current_question_index: number;
  questions_json: string;
  comparison_json: string;
  summary: string;
  meme_text: string;
  created_at: string;
  updated_at: string;
};

type PlayerRow = {
  id: string;
  name: string;
  seat: number;
  joined_at: string;
  answer_count: number;
};

type FileRow = {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};

export function getDatabase() {
  const database = getRuntimeEnv().DB;
  if (!database) {
    throw new Error("The DB binding is not available yet.");
  }
  return database;
}

export function getBucket() {
  const bucket = getRuntimeEnv().BUCKET;
  if (!bucket) {
    throw new Error("The BUCKET binding is not available yet.");
  }
  return bucket;
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function asStatus(value: string): RoomStatus {
  if (value === "asking" || value === "live" || value === "complete") return value;
  return "waiting";
}

export async function getRoomSnapshot(roomId: string): Promise<RoomSnapshot | null> {
  const db = getDatabase();
  const room = await db
    .prepare(
      `SELECT id, title, context, player_count, timer_minutes, meme_enabled, status,
        current_question_index, questions_json, comparison_json, summary, meme_text,
        created_at, updated_at
       FROM rooms WHERE id = ?1 LIMIT 1`,
    )
    .bind(roomId)
    .first<RoomRow>();

  if (!room) return null;

  const playerRows = await db
    .prepare(
      `SELECT p.id, p.name, p.seat, p.joined_at,
        COUNT(a.id) AS answer_count
       FROM players p
       LEFT JOIN answers a ON a.player_id = p.id
       WHERE p.room_id = ?1
       GROUP BY p.id, p.name, p.seat, p.joined_at
       ORDER BY p.seat ASC`,
    )
    .bind(roomId)
    .all<PlayerRow>();

  const fileRows = await db
    .prepare(
      `SELECT id, filename, content_type, size_bytes, created_at
       FROM room_files WHERE room_id = ?1 ORDER BY created_at ASC`,
    )
    .bind(roomId)
    .all<FileRow>();

  return {
    id: room.id,
    title: room.title,
    context: room.context,
    playerCount: Number(room.player_count),
    timerMinutes: Number(room.timer_minutes),
    memeEnabled: Boolean(room.meme_enabled),
    status: asStatus(room.status),
    currentQuestionIndex: Number(room.current_question_index),
    questions: parseJson<RoomQuestion[]>(room.questions_json, []),
    comparison: parseJson<RoomComparison[]>(room.comparison_json, []),
    summary: room.summary ?? "",
    memeText: room.meme_text ?? "",
    createdAt: room.created_at,
    updatedAt: room.updated_at,
    players: (playerRows.results ?? []).map((player) => ({
      id: player.id,
      name: player.name,
      seat: Number(player.seat),
      joinedAt: player.joined_at,
      answerCount: Number(player.answer_count ?? 0),
    })) as RoomPlayer[],
    files: (fileRows.results ?? []).map((file) => ({
      id: file.id,
      filename: file.filename,
      contentType: file.content_type,
      sizeBytes: Number(file.size_bytes ?? 0),
      createdAt: file.created_at,
    })) as RoomFile[],
  };
}

export function makeRoomId() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
}

export function makeToken() {
  return crypto.randomUUID().replaceAll("-", "");
}
