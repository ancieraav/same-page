import assert from "node:assert/strict";
import test, { after } from "node:test";

import { createServer } from "vite";

const root = new URL("..", import.meta.url).pathname;
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

test("validates room setup and normalizes room codes", async () => {
  const validation = await vite.ssrLoadModule("/lib/samepage/validation.ts");

  assert.equal(validation.normalizeRoomCode("ab-12 xyz"), "AB12XYZ");
  assert.equal(validation.roomCodeSchema.safeParse("ab12xyz").success, true);
  assert.equal(validation.roomCodeSchema.safeParse("short").success, false);

  const valid = validation.createRoomSchema.safeParse({
    roomName: "Product critique",
    topic: "A product decision",
    notes: "",
    participantMode: "fixed",
    participantCount: "4",
    useMemes: "yes",
    useRoles: "yes",
    separateAccess: "yes",
    shareResponses: "yes",
    anonymousNames: "yes",
    roles: ["Source of truth"],
  });
  assert.equal(valid.success, true);

  const invalid = validation.createRoomSchema.safeParse({
    roomName: "x",
    topic: "",
    notes: "",
    participantMode: "fixed",
    participantCount: "1",
    useMemes: "no",
    useRoles: "yes",
    separateAccess: "no",
    shareResponses: "no",
    anonymousNames: "no",
    roles: [],
  });
  assert.equal(invalid.success, false);
});

test("calculates summary metrics from persisted state", async () => {
  const { buildRoomSummary } = await vite.ssrLoadModule("/lib/samepage/summary.ts");
  const state = {
    room: {
      id: "room",
      code: "ABC1234",
      join_token: null,
      room_name: "Room",
      topic: "Topic",
      notes: "",
      status: "completed",
      phase: "summary",
      participant_mode: "flexible",
      participant_limit: null,
      use_memes: false,
      use_roles: false,
      separate_access: false,
      share_responses: true,
      anonymous_names: true,
      current_question_id: "choice",
      operator_id: "operator",
      version: 1,
      created_at: "2026-01-01T00:00:00Z",
      started_at: null,
      completed_at: null,
    },
    members: [
      { id: "m1", room_id: "room", user_id: "u1", display_name: "One", member_type: "operator", role_id: null, joined_at: "", left_at: null, last_seen_at: "" },
      { id: "m2", room_id: "room", user_id: "u2", display_name: "Two", member_type: "participant", role_id: null, joined_at: "", left_at: null, last_seen_at: "" },
    ],
    roles: [],
    questions: [
      { id: "choice", room_id: "room", ordinal: 1, kind: "choice", prompt: "Choose", options: [{ id: "a", label: "A" }, { id: "b", label: "B" }], is_system: true, created_by: null, created_at: "", skipped_at: null },
    ],
    responses: [
      { id: "r1", room_id: "room", question_id: "choice", member_id: "m1", answer_text: null, option_id: "a", submitted_at: "", updated_at: "" },
      { id: "r2", room_id: "room", question_id: "choice", member_id: "m2", answer_text: null, option_id: "a", submitted_at: "", updated_at: "" },
    ],
    assets: [],
    currentMember: null,
  };

  const summary = buildRoomSummary(state);
  assert.equal(summary.participantCount, 2);
  assert.equal(summary.responseCount, 2);
  assert.equal(summary.completionPercent, 100);
  assert.deepEqual(summary.optionBreakdown, [{ label: "A", count: 2 }]);
});
