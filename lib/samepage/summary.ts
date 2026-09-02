import type { RoomState } from "./types";

export type RoomSummary = {
  participantCount: number;
  questionCount: number;
  answeredParticipants: number;
  responseCount: number;
  completionPercent: number;
  optionBreakdown: Array<{ label: string; count: number }>;
  visibleResponses: number;
  latestQuestion: string;
};

export function buildRoomSummary(state: RoomState): RoomSummary {
  const activeMembers = state.members.filter((member) => !member.left_at);
  const currentQuestion = state.questions.find(
    (question) => question.id === state.room.current_question_id,
  );
  const currentResponses = currentQuestion
    ? state.responses.filter((response) => response.question_id === currentQuestion.id)
    : [];

  const optionBreakdown = currentQuestion?.options
    .map((option) => ({
      label: option.label,
      count: currentResponses.filter((response) => response.option_id === option.id)
        .length,
    }))
    .filter((option) => option.count > 0) ?? [];

  const totalExpected = Math.max(activeMembers.length * state.questions.length, 1);
  const completionPercent = Math.round(
    Math.min((state.responses.length / totalExpected) * 100, 100),
  );

  return {
    participantCount: activeMembers.length,
    questionCount: state.questions.length,
    answeredParticipants: new Set(state.responses.map((response) => response.member_id)).size,
    responseCount: state.responses.length,
    completionPercent,
    optionBreakdown,
    visibleResponses: state.responses.length,
    latestQuestion: currentQuestion?.prompt ?? "The room is ready for its next question.",
  };
}
