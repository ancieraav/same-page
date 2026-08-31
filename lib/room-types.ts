export type RoomStatus = "waiting" | "asking" | "live" | "complete";

export type RoomQuestion = {
  id: string;
  prompt: string;
  helper?: string;
  options?: string[];
};

export type RoomComparison = {
  questionId: string;
  prompt: string;
  answerCount: number;
  match: boolean;
  note: string;
};

export type RoomFile = {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

export type RoomPlayer = {
  id: string;
  name: string;
  seat: number;
  joinedAt: string;
  answerCount: number;
};

export type RoomSnapshot = {
  id: string;
  title: string;
  context: string;
  playerCount: number;
  timerMinutes: number;
  memeEnabled: boolean;
  status: RoomStatus;
  currentQuestionIndex: number;
  questions: RoomQuestion[];
  comparison: RoomComparison[];
  summary: string;
  memeText: string;
  createdAt: string;
  updatedAt: string;
  players: RoomPlayer[];
  files: RoomFile[];
};
