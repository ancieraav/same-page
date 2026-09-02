export type YesNo = "no" | "yes";
export type ParticipantMode = "flexible" | "fixed";
export type RoomStatus = "waiting" | "active" | "completed";
export type RoomPhase =
  | "waiting"
  | "answer"
  | "compare"
  | "meme"
  | "add_question"
  | "summary";
export type QuestionKind = "text" | "choice";
export type MemberType = "operator" | "participant";

export type RoomRole = {
  id: string;
  room_id: string;
  name: string;
  position: number;
};

export type Room = {
  id: string;
  code: string;
  join_token: string | null;
  room_name: string;
  topic: string;
  notes: string;
  status: RoomStatus;
  phase: RoomPhase;
  participant_mode: ParticipantMode;
  participant_limit: number | null;
  use_memes: boolean;
  use_roles: boolean;
  separate_access: boolean;
  share_responses: boolean;
  anonymous_names: boolean;
  current_question_id: string | null;
  operator_id: string;
  version: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type RoomMember = {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  member_type: MemberType;
  role_id: string | null;
  joined_at: string;
  left_at: string | null;
  last_seen_at: string;
  role_name?: string | null;
};

export type QuestionOption = {
  id: string;
  label: string;
};

export type RoomQuestion = {
  id: string;
  room_id: string;
  ordinal: number;
  kind: QuestionKind;
  prompt: string;
  options: QuestionOption[];
  is_system: boolean;
  created_by: string | null;
  created_at: string;
  skipped_at: string | null;
};

export type RoomResponse = {
  id: string;
  room_id: string;
  question_id: string;
  member_id: string;
  answer_text: string | null;
  option_id: string | null;
  submitted_at: string;
  updated_at: string;
  member?: RoomMember;
};

export type RoomAsset = {
  id: string;
  room_id: string;
  storage_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_by: string;
  created_at: string;
};

export type RoomState = {
  room: Room;
  members: RoomMember[];
  roles: RoomRole[];
  questions: RoomQuestion[];
  responses: RoomResponse[];
  assets: RoomAsset[];
  currentMember: RoomMember | null;
};

export type RoomActionResult = {
  ok: boolean;
  room_code: string;
  room_id: string;
  status: RoomStatus;
  phase: RoomPhase;
  current_question_id: string | null;
  message: string;
};

export type CreatedRoomResult = {
  room: Room;
  member: RoomMember;
  roles: RoomRole[];
  questions: RoomQuestion[];
  joinUrl: string;
};
