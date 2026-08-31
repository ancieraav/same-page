import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable(
  "rooms",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    context: text("context").notNull().default(""),
    playerCount: integer("player_count").notNull().default(2),
    timerMinutes: integer("timer_minutes").notNull().default(5),
    memeEnabled: integer("meme_enabled", { mode: "boolean" }).notNull().default(true),
    status: text("status").notNull().default("waiting"),
    currentQuestionIndex: integer("current_question_index").notNull().default(0),
    questionsJson: text("questions_json").notNull().default("[]"),
    comparisonJson: text("comparison_json").notNull().default("[]"),
    summary: text("summary").notNull().default(""),
    memeText: text("meme_text").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    statusIndex: index("idx_rooms_status_updated").on(table.status, table.updatedAt),
  }),
);

export const players = sqliteTable(
  "players",
  {
    id: text("id").primaryKey(),
    roomId: text("room_id").notNull(),
    name: text("name").notNull(),
    playerToken: text("player_token").notNull(),
    seat: integer("seat").notNull(),
    joinedAt: text("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    roomIndex: index("idx_players_room").on(table.roomId),
    tokenIndex: uniqueIndex("idx_players_token").on(table.playerToken),
  }),
);

export const answers = sqliteTable(
  "answers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomId: text("room_id").notNull(),
    playerId: text("player_id").notNull(),
    questionId: text("question_id").notNull(),
    answer: text("answer").notNull(),
    submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    roomQuestionIndex: index("idx_answers_room_question").on(table.roomId, table.questionId),
    playerQuestionIndex: uniqueIndex("idx_answers_player_question").on(
      table.playerId,
      table.questionId,
    ),
  }),
);

export const roomFiles = sqliteTable(
  "room_files",
  {
    id: text("id").primaryKey(),
    roomId: text("room_id").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull().default("application/octet-stream"),
    sizeBytes: integer("size_bytes").notNull().default(0),
    r2Key: text("r2_key").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    roomIndex: index("idx_room_files_room").on(table.roomId),
  }),
);
