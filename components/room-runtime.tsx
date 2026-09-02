"use client";

import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardIcon,
  EyeIcon,
  LockKeyholeIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  acknowledgeCompare,
  acknowledgeMeme,
  addQuestion,
  buildJoinUrl,
  buildRoomHref,
  getInviteTokenFromLocation,
  getRoomCodeFromLocation,
  leaveRoom,
  loadRoomState,
  startRoom,
  subscribeToRoom,
  submitResponse,
  updateMemberRole,
  uploadRoomAttachment,
  skipQuestion,
} from "@/lib/samepage/client";
import { getErrorMessage, SamePageError } from "@/lib/samepage/errors";
import { MEMES } from "@/lib/samepage/memes";
import { buildRoomSummary } from "@/lib/samepage/summary";
import type {
  RoomActionResult,
  RoomMember,
  RoomQuestion,
  RoomState,
} from "@/lib/samepage/types";
import { useWebMcpTools, webMcpTool, type WebMcpTool } from "@/lib/webmcp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FlowActions,
  FlowPill,
  ParticipantAvatar,
  RoomFlowShell,
} from "@/components/room-flow";

export type RoomRuntimeMode =
  | "waiting"
  | "question"
  | "compare"
  | "options"
  | "meme"
  | "add-question"
  | "summary"
  | "participants";

const PAGE_COPY: Record<RoomRuntimeMode, { title: string; description: string }> = {
  waiting: {
    title: "Waiting room",
    description: "Everyone can join here. Your connected agent starts the room when it is ready.",
  },
  question: {
    title: "Answer the question",
    description: "Write your answer independently, then compare perspectives with the room.",
  },
  compare: {
    title: "Compare responses",
    description: "Take in both perspectives before the room moves to the next prompt.",
  },
  options: {
    title: "Choose an answer",
    description: "Pick the direction that feels closest to your perspective.",
  },
  meme: {
    title: "Meme break",
    description: "Take a small reset before the next question.",
  },
  "add-question": {
    title: "Add a question",
    description: "Shape the next prompt while the room is still together.",
  },
  summary: {
    title: "Room summary",
    description: "Review the outcome of the room using the responses it collected.",
  },
  participants: {
    title: "See other participants",
    description: "Keep the room context in view while you review shared responses.",
  },
};

const BACK_PATHS: Record<RoomRuntimeMode, string> = {
  waiting: "/",
  question: "/waiting-room",
  compare: "/question",
  options: "/question-two",
  meme: "/question-two-options",
  "add-question": "/meme",
  summary: "/add-question",
  participants: "/summary",
};

function routeForRoomState(state: RoomState): string {
  if (state.room.status === "completed" || state.room.phase === "summary") return "/summary";
  if (state.room.status === "waiting" || state.room.phase === "waiting") return "/waiting-room";
  if (state.room.phase === "compare") return "/question-two";
  if (state.room.phase === "meme") return "/meme";
  if (state.room.phase === "add_question") return "/add-question";

  const question = state.questions.find(
    (candidate) => candidate.id === state.room.current_question_id,
  );
  return question?.kind === "choice" ? "/question-two-options" : "/question";
}

function routeForResult(result: RoomActionResult, state: RoomState | null): string {
  if (state) return routeForRoomState(state);
  if (result.status === "completed" || result.phase === "summary") return "/summary";
  if (result.phase === "compare") return "/question-two";
  if (result.phase === "meme") return "/meme";
  if (result.phase === "add_question") return "/add-question";
  return "/question";
}

function currentQuestion(state: RoomState): RoomQuestion | null {
  return (
    state.questions.find(
      (question) => question.id === state.room.current_question_id,
    ) ?? null
  );
}

function activeMembers(state: RoomState): RoomMember[] {
  return state.members.filter((member) => !member.left_at);
}

function canEditQuestions(state: RoomState): boolean {
  return (
    state.currentMember?.member_type === "operator" ||
    state.currentMember?.role_name === "Source of truth"
  );
}

function displayResponseName(
  state: RoomState,
  member: RoomMember | undefined,
): string {
  if (!member) return "Participant";
  if (
    state.room.anonymous_names &&
    member.user_id !== state.currentMember?.user_id
  ) {
    return "Participant";
  }
  return member.display_name;
}

function roomStateForAgent(state: RoomState) {
  const question = currentQuestion(state);
  return {
    ok: true,
    room: {
      code: state.room.code,
      name: state.room.room_name,
      topic: state.room.topic,
      status: state.room.status,
      phase: state.room.phase,
      participantCount: activeMembers(state).length,
      participantLimit: state.room.participant_limit,
      currentQuestionId: state.room.current_question_id,
    },
    currentQuestion: question
      ? { id: question.id, kind: question.kind, prompt: question.prompt }
      : null,
    participants: activeMembers(state).map((member) => ({
      id: member.id,
      name: member.display_name,
      memberType: member.member_type,
      role: member.role_name,
    })),
    responseCount: state.responses.length,
  };
}

function actionRoute(result: RoomActionResult, state: RoomState | null, code: string): string {
  return buildRoomHref(routeForResult(result, state), code);
}

function useRoomState(code: string) {
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(Boolean(code));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<RoomState | null> => {
    if (!code) return null;
    try {
      const next = await loadRoomState(code);
      setState(next);
      setError(null);
      return next;
    } catch (cause) {
      setError(getErrorMessage(cause));
      return null;
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (!code) {
      return;
    }

    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    let refreshTimer: number | undefined;

    const refreshFromEvent = () => {
      if (refreshTimer !== undefined) return;
      refreshTimer = window.setTimeout(() => {
        refreshTimer = undefined;
        if (!disposed) void refresh();
      }, 100);
    };

    void (async () => {
      const next = await refresh();
      if (disposed || !next) return;
      const stop = await subscribeToRoom(next.room.id, refreshFromEvent);
      if (disposed) stop();
      else unsubscribe = stop;
    })();

    const fallbackInterval = window.setInterval(() => {
      if (!disposed) void refresh();
    }, 15000);

    return () => {
      disposed = true;
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
      window.clearInterval(fallbackInterval);
      unsubscribe?.();
    };
  }, [code, refresh]);

  return { state, loading, error, refresh };
}

function LoadingState() {
  return (
    <div className="flow-empty-state" role="status">
      Loading room…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flow-empty-state flow-error-state" role="alert">
      <strong>{message}</strong>
      <Button className="small-flow-button" variant="outline" asChild>
        <Link href="/">Return to join room</Link>
      </Button>
    </div>
  );
}

function MissingRoomCode() {
  return <ErrorState message="Open a room link or enter a room code first." />;
}

function WaitingView({
  state,
  code,
  webmcpAvailable,
  refresh,
}: {
  state: RoomState;
  code: string;
  webmcpAvailable: boolean;
  refresh: () => Promise<RoomState | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy invite");
  const inviteToken = getInviteTokenFromLocation() ?? state.room.join_token;
  const inviteUrl = buildJoinUrl(code, state.room.separate_access ? inviteToken : null);
  const members = activeMembers(state);
  const isOperator = state.currentMember?.member_type === "operator";
  const attachmentError =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("attachmentError");

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy invite"), 1600);
    } catch {
      setMessage("Copy was blocked by the browser. Share the invite link manually.");
    }
  }

  async function handleLeave() {
    if (!state.currentMember) return;
    setBusy(true);
    try {
      await leaveRoom(state.room.id);
      window.location.assign("/");
    } catch (cause) {
      setMessage(getErrorMessage(cause));
      setBusy(false);
    }
  }

  async function handleRoleChange(roleId: string) {
    setBusy(true);
    try {
      await updateMemberRole(state.room.id, roleId || null);
      await refresh();
    } catch (cause) {
      setMessage(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="waiting-room-stage" aria-labelledby="waiting-room-title">
      <div className="waiting-room-stage-heading">
        <FlowPill>
          <span className="status-dot" aria-hidden="true" />
          {state.room.status === "waiting" ? "Room is open" : "Room is active"}
        </FlowPill>
        <h2 id="waiting-room-title">{state.room.room_name}</h2>
        <p>
          {members.length} {state.room.participant_limit ? `/ ${state.room.participant_limit} ` : ""}
          people are here · Room code <strong>{state.room.code}</strong>
        </p>
      </div>

      <div className="waiting-room-meta room-runtime-meta">
        <span>
          <UsersIcon aria-hidden="true" />
          {state.room.topic}
        </span>
        <span>
          <ShieldCheckIcon aria-hidden="true" />
          {state.room.separate_access ? "Invite link + code" : "Room code access"}
        </span>
      </div>

      {isOperator ? (
        <div className="waiting-room-attachment">
          <div>
            <span className="flow-label">Room attachment</span>
            <strong>{state.assets[0]?.file_name ?? "No attachment yet"}</strong>
          </div>
          <UploadAttachmentButton roomId={state.room.id} onUploaded={() => void refresh()} />
        </div>
      ) : null}

      <div className="participant-orbit waiting-room-stage-people" aria-label="People in the room">
        <span className="orbit-line orbit-line-one" aria-hidden="true" />
        <span className="orbit-line orbit-line-two" aria-hidden="true" />
        {members.map((member, index) => (
          <div className={`participant-bubble participant-runtime-${index % 4}`} key={member.id}>
            <ParticipantAvatar name={member.display_name} />
            <div>
              <strong>{member.display_name}</strong>
              <span>{member.member_type === "operator" ? "Operator" : member.role_name ?? "Participant"}</span>
            </div>
          </div>
        ))}
        <div className="participant-center-mark" aria-hidden="true">
          <span>SP</span>
        </div>
      </div>

      {state.room.use_roles && state.currentMember && state.currentMember.member_type !== "operator" ? (
        <label className="room-role-picker">
          <span>Your role</span>
          <select
            value={state.currentMember.role_id ?? ""}
            disabled={busy || state.room.status !== "waiting"}
            onChange={(event) => void handleRoleChange(event.target.value)}
          >
            <option value="">Participant</option>
            {state.roles.map((role) => (
              <option value={role.id} key={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="waiting-room-agent-status" role="status">
        {isOperator ? (
          <>
            <strong>Waiting for your agent to start this room.</strong>
            <span>
              {webmcpAvailable
                ? "The start_room tool is available to the connected agent."
                : "Open this page in a WebMCP-enabled browser for the agent start tool."}
            </span>
          </>
        ) : (
          <>
            <strong>The operator&apos;s agent will start the room.</strong>
            <span>You can leave this page open while everyone gets ready.</span>
          </>
        )}
      </div>

      <div className="waiting-room-actions runtime-actions">
        <Button className="flow-action flow-action-secondary" variant="outline" type="button" onClick={() => void copyInvite()}>
          <ClipboardIcon aria-hidden="true" />
          {copyLabel}
        </Button>
        <Button className="flow-action flow-action-secondary" variant="outline" type="button" disabled={busy} onClick={() => void handleLeave()}>
          Leave room
        </Button>
      </div>
      {attachmentError ? <p className="flow-inline-error" role="alert">{attachmentError}</p> : null}
      {message ? <p className="flow-inline-error" role="alert">{message}</p> : null}
    </section>
  );
}

function QuestionView({
  state,
  code,
  refresh,
  navigate,
}: {
  state: RoomState;
  code: string;
  refresh: () => Promise<RoomState | null>;
  navigate: (path: string) => void;
}) {
  const question = currentQuestion(state);
  const existing = state.responses.find(
    (response) =>
      response.question_id === question?.id && response.member_id === state.currentMember?.id,
  );
  const [answer, setAnswer] = useState(existing?.answer_text ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!question) return <ErrorState message="This room does not have a current question." />;

  async function handleSubmit() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await submitResponse({
        roomId: state.room.id,
        questionId: question.id,
        answerText: answer,
      });
      const next = await refresh();
      navigate(actionRoute(result, next, code));
    } catch (cause) {
      setMessage(getErrorMessage(cause));
      setBusy(false);
    }
  }

  const responseCount = state.responses.filter((response) => response.question_id === question.id).length;
  const memberCount = activeMembers(state).length;

  return (
    <section className="question-stage runtime-question-stage" aria-labelledby="question-prompt">
      <div className="question-stage-meta">
        <span>Question {question.ordinal}</span>
        <span>{responseCount} of {memberCount} submitted</span>
      </div>
      <h2 id="question-prompt">{question.prompt}</h2>
      <p className="question-stage-description">
        Write what you believe before the room compares perspectives.
      </p>
      <Textarea
        className="participant-answer"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Start writing your answer…"
        rows={8}
        aria-label="Your answer"
        disabled={busy}
      />
      <div className="answer-footer">
        <span className="answer-privacy">
          <LockKeyholeIcon aria-hidden="true" />
          Your answer stays private until the room is ready to compare.
        </span>
        <Button className="flow-action flow-action-primary" type="button" disabled={busy} onClick={() => void handleSubmit()}>
          Submit answer
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </div>
      {message ? <p className="flow-inline-error" role="alert">{message}</p> : null}
    </section>
  );
}

function CompareView({
  state,
  code,
  refresh,
  navigate,
}: {
  state: RoomState;
  code: string;
  refresh: () => Promise<RoomState | null>;
  navigate: (path: string) => void;
}) {
  const question = currentQuestion(state);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (!question) return <ErrorState message="This room does not have a question to compare." />;

  const responses = state.responses.filter((response) => response.question_id === question.id);

  async function handleContinue() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await acknowledgeCompare(state.room.id, question.id);
      const next = await refresh();
      navigate(actionRoute(result, next, code));
    } catch (cause) {
      setMessage(getErrorMessage(cause));
      setBusy(false);
    }
  }

  return (
    <section className="compare-stage runtime-compare-stage" aria-labelledby="compare-prompt">
      <div className="compare-stage-heading">
        <div>
          <span className="question-counter">Question {question.ordinal}</span>
          <h2 id="compare-prompt">Compare the room&apos;s perspectives</h2>
          <p>Everyone has submitted. Notice where the answers meet or differ.</p>
        </div>
        <FlowPill>
          <CheckIcon aria-hidden="true" />
          Ready to compare
        </FlowPill>
      </div>

      <div className="response-comparison">
        {responses.length === 0 ? (
          <div className="flow-empty-state">Responses are still arriving.</div>
        ) : (
          responses.map((response, index) => (
            <article className={`response-card ${index === 0 ? "response-card-primary" : ""}`} key={response.id}>
              <div className="response-card-heading">
                <ParticipantAvatar name={displayResponseName(state, response.member)} />
                <div>
                  <strong>{displayResponseName(state, response.member)}</strong>
                  <span>{response.member?.role_name ?? "Participant"}</span>
                </div>
              </div>
              <p>{response.answer_text ?? "No written response."}</p>
              <span className="response-tag">Shared perspective</span>
            </article>
          ))
        )}
      </div>

      <div className="compare-actions runtime-actions">
        <Button className="flow-action flow-action-primary" type="button" disabled={busy} onClick={() => void handleContinue()}>
          Continue
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </div>
      {message ? <p className="flow-inline-error" role="alert">{message}</p> : null}
    </section>
  );
}

function OptionsView({
  state,
  code,
  refresh,
  navigate,
}: {
  state: RoomState;
  code: string;
  refresh: () => Promise<RoomState | null>;
  navigate: (path: string) => void;
}) {
  const question = currentQuestion(state);
  const existing = state.responses.find(
    (response) =>
      response.question_id === question?.id && response.member_id === state.currentMember?.id,
  );
  const [selected, setSelected] = useState(existing?.option_id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (!question) return <ErrorState message="This room does not have a current choice question." />;

  async function handleSubmit() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await submitResponse({
        roomId: state.room.id,
        questionId: question.id,
        optionId: selected,
      });
      const next = await refresh();
      navigate(actionRoute(result, next, code));
    } catch (cause) {
      setMessage(getErrorMessage(cause));
      setBusy(false);
    }
  }

  return (
    <section className="options-stage runtime-options-stage" aria-labelledby="options-prompt">
      <div className="options-stage-heading">
        <span className="question-counter">Question {question.ordinal}</span>
        <h2 id="options-prompt">{question.prompt}</h2>
        <p>Choose one direction. You can explain the reasoning in the room summary.</p>
      </div>

      <fieldset className="question-options">
        <legend className="sr-only">Choose one answer</legend>
        {question.options.map((option) => (
          <label className={`question-option ${selected === option.id ? "question-option-selected" : ""}`} key={option.id}>
            <input
              type="radio"
              name="room-choice"
              value={option.id}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
              disabled={busy}
            />
            <span className="question-option-marker" aria-hidden="true" />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="options-actions runtime-actions">
        <Button className="flow-action flow-action-primary" type="button" disabled={busy || !selected} onClick={() => void handleSubmit()}>
          Submit choice
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </div>
      {message ? <p className="flow-inline-error" role="alert">{message}</p> : null}
    </section>
  );
}

function MemeView({
  state,
  code,
  refresh,
  navigate,
}: {
  state: RoomState;
  code: string;
  refresh: () => Promise<RoomState | null>;
  navigate: (path: string) => void;
}) {
  const question = currentQuestion(state);
  const meme = MEMES[state.room.version % MEMES.length];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!question) return <ErrorState message="This room does not have a current question." />;

  async function handleContinue() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await acknowledgeMeme(state.room.id, question.id);
      const next = await refresh();
      navigate(actionRoute(result, next, code));
    } catch (cause) {
      setMessage(getErrorMessage(cause));
      setBusy(false);
    }
  }

  return (
    <section className="meme-stage runtime-meme-stage" aria-labelledby="meme-title">
      <div className="meme-stage-heading">
        <span className="question-counter">Room reset</span>
        <h2 id="meme-title">{meme.detail}</h2>
        <p>A small reset before the room returns to the next question.</p>
      </div>

      <div className={`meme-art ${meme.accent}`} role="img" aria-label={`${meme.eyebrow}: ${meme.title}`}>
        <div className="meme-art-sun" aria-hidden="true" />
        <div className="meme-art-cloud meme-art-cloud-one" aria-hidden="true" />
        <div className="meme-art-cloud meme-art-cloud-two" aria-hidden="true" />
        <div className="meme-art-copy">
          <span>{meme.eyebrow}</span>
          <strong>{meme.title}</strong>
        </div>
      </div>

      <div className="meme-footer runtime-actions">
        <Button className="flow-action flow-action-primary" type="button" disabled={busy} onClick={() => void handleContinue()}>
          Next question
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </div>
      {message ? <p className="flow-inline-error" role="alert">{message}</p> : null}
    </section>
  );
}

function AddQuestionView({
  state,
  code,
  refresh,
  navigate,
}: {
  state: RoomState;
  code: string;
  refresh: () => Promise<RoomState | null>;
  navigate: (path: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canEdit = canEditQuestions(state);

  async function handleAdd() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await addQuestion(state.room.id, prompt);
      const next = await refresh();
      navigate(actionRoute(result, next, code));
    } catch (cause) {
      setMessage(getErrorMessage(cause));
      setBusy(false);
    }
  }

  async function handleSkip() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await skipQuestion(state.room.id);
      const next = await refresh();
      navigate(actionRoute(result, next, code));
    } catch (cause) {
      setMessage(getErrorMessage(cause));
      setBusy(false);
    }
  }

  return (
    <section className="add-question-layout runtime-add-question" aria-labelledby="add-question-title">
      <div className="add-question-main">
        <span className="question-counter">Operator control</span>
        <h2 id="add-question-title">Want to add another question?</h2>
        <p>Keep it focused. A good question gives everyone a clear place to start.</p>
        {canEdit ? (
          <>
            <Textarea
              className="new-question-input"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Write the next question…"
              rows={7}
              aria-label="New question"
              disabled={busy}
            />
            <div className="add-question-actions runtime-actions">
              <Button className="flow-action flow-action-secondary" variant="outline" type="button" disabled={busy} onClick={() => void handleSkip()}>
                Skip
              </Button>
              <Button className="flow-action flow-action-primary" type="button" disabled={busy || prompt.trim().length < 5} onClick={() => void handleAdd()}>
                Add question
                <ArrowRightIcon aria-hidden="true" />
              </Button>
            </div>
          </>
        ) : (
          <div className="waiting-room-agent-status" role="status">
            <strong>Waiting for the operator or source of truth.</strong>
            <span>They can add another question or finish the room.</span>
          </div>
        )}
        {message ? <p className="flow-inline-error" role="alert">{message}</p> : null}
      </div>
    </section>
  );
}

function SummaryView({ state, code }: { state: RoomState; code: string }) {
  const summary = buildRoomSummary(state);
  const topOption = summary.optionBreakdown
    .slice()
    .sort((a, b) => b.count - a.count)[0];

  return (
    <section className="runtime-summary-content">
      <section className="summary-overview" aria-label="Room overview">
        <div className="summary-stat-card">
          <span className="flow-label">Room</span>
          <strong>{state.room.room_name}</strong>
          <span>{state.room.code} · {summary.participantCount} people</span>
        </div>
        <div className="summary-stat-card">
          <span className="flow-label">Participation</span>
          <strong>{summary.completionPercent}% complete</strong>
          <span><UsersIcon aria-hidden="true" /> {summary.responseCount} responses collected</span>
        </div>
      </section>

      <section className="summary-hero" aria-labelledby="summary-hero-title">
        <div className="summary-hero-score">
          <span>Room completion</span>
          <strong>{summary.completionPercent}%</strong>
          <span className="summary-score-delta">{summary.questionCount} questions in the room</span>
        </div>
        <div className="summary-hero-copy">
          <FlowPill><CheckIcon aria-hidden="true" /> Room complete</FlowPill>
          <h2 id="summary-hero-title">The room left a record everyone can pick up.</h2>
          <p>{state.room.topic}</p>
        </div>
      </section>

      <FlowActions
        className="summary-centered-action"
        primaryHref={buildRoomHref("/see-participant", code)}
        primaryLabel={state.room.share_responses ? "See participant responses" : "Review room data"}
      />

      <section className="summary-outcome" aria-labelledby="summary-outcome-title">
        <div className="summary-outcome-copy">
          <span className="flow-eyebrow">The latest signal</span>
          <h2 id="summary-outcome-title">{topOption?.label ?? "The room captured written perspectives."}</h2>
          <p>{summary.latestQuestion}</p>
        </div>
        <FlowPill>{summary.visibleResponses} visible responses</FlowPill>
      </section>

      <section className="summary-section summary-reflection" aria-labelledby="summary-reflection-title">
        <div className="summary-section-heading">
          <div>
            <span className="flow-eyebrow">Room reflection</span>
            <h2 id="summary-reflection-title">What the room collected</h2>
          </div>
          <EyeIcon aria-hidden="true" />
        </div>
        <div className="summary-reflection-grid">
          <article>
            <span className="flow-label">Questions</span>
            <strong>{summary.questionCount} prompts completed or added.</strong>
          </article>
          <article>
            <span className="flow-label">Participants</span>
            <strong><ParticipantAvatar name="SP" /> {summary.answeredParticipants} people contributed.</strong>
          </article>
        </div>
      </section>

      <section className="summary-section" aria-labelledby="summary-patterns-title">
        <div className="summary-section-heading">
          <div>
            <span className="flow-eyebrow">Choice distribution</span>
            <h2 id="summary-patterns-title">What people selected</h2>
          </div>
          <span className="summary-section-count">{summary.optionBreakdown.length} options</span>
        </div>
        <div className="summary-theme-grid">
          {(summary.optionBreakdown.length > 0
            ? summary.optionBreakdown
            : [{ label: "Written perspectives", count: summary.responseCount }]
          ).map((option, index) => (
            <article className={`summary-theme-card summary-theme-${["green", "yellow", "lilac"][index % 3]}`} key={option.label}>
              <span className="summary-theme-number">0{index + 1}</span>
              <h3>{option.label}</h3>
              <p>{option.count} {option.count === 1 ? "response" : "responses"}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="summary-bottom-actions">
        <FlowPill><ShieldCheckIcon aria-hidden="true" /> Summary is ready</FlowPill>
        <Link className="text-action" href="/">Leave room <ArrowRightIcon aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

function ParticipantsView({ state, code }: { state: RoomState; code: string }) {
  if (!state.room.share_responses) {
    return (
      <section className="flow-empty-state" role="status">
        <ShieldCheckIcon aria-hidden="true" />
        <strong>Participant responses are private in this room.</strong>
        <span>The operator disabled shared responses when the room was created.</span>
        <Button className="small-flow-button" variant="outline" asChild>
          <Link href={buildRoomHref("/summary", code)}>Back to summary</Link>
        </Button>
      </section>
    );
  }

  const grouped = state.questions.flatMap((question) =>
    state.responses
      .filter((response) => response.question_id === question.id)
      .map((response) => ({ question, response })),
  );

  return (
    <section className="runtime-participants-content">
      <section className="participant-overview" aria-label="Participant overview">
        {activeMembers(state).slice(0, 2).map((member) => (
          <article className="participant-overview-card" key={member.id}>
            <ParticipantAvatar
              name={
                state.room.anonymous_names && member.user_id !== state.currentMember?.user_id
                  ? "Participant"
                  : member.display_name
              }
            />
            <div>
              <span className="flow-label">{member.member_type === "operator" ? "Operator" : member.role_name ?? "Participant"}</span>
              <strong>{state.room.anonymous_names && member.user_id !== state.currentMember?.user_id ? "Anonymous participant" : member.display_name}</strong>
              <span>{state.responses.filter((response) => response.member_id === member.id).length} responses</span>
            </div>
            <FlowPill>Complete</FlowPill>
          </article>
        ))}
      </section>

      <div className="participant-toolbar">
        <div>
          <span className="flow-eyebrow">Shared responses</span>
          <strong>What the room contributed</strong>
        </div>
        <span className="toolbar-chip"><EyeIcon aria-hidden="true" /> Shared with the room</span>
      </div>

      <section className="participant-response-list" aria-label="Participant responses">
        {grouped.length === 0 ? <div className="flow-empty-state">No responses are visible yet.</div> : null}
        {grouped.map(({ question, response }) => (
          <article className="participant-response-row" key={response.id}>
            <ParticipantAvatar name={displayResponseName(state, response.member)} />
            <div>
              <span className="flow-label">Question {question.ordinal}</span>
              <strong>{displayResponseName(state, response.member)}</strong>
              <p>{response.answer_text ?? question.options.find((option) => option.id === response.option_id)?.label ?? "Selected an option."}</p>
            </div>
            <span><MessageCircleIcon aria-hidden="true" /> Response</span>
          </article>
        ))}
      </section>

      <FlowActions
        className="participant-bottom-actions"
        secondaryHref={buildRoomHref("/summary", code)}
        secondaryLabel="Back to summary"
        primaryHref="/"
        primaryLabel="Finish room"
      />
    </section>
  );
}

function buildWebMcpTools({
  mode,
  code,
  state,
  refresh,
  navigate,
}: {
  mode: RoomRuntimeMode;
  code: string;
  state: RoomState | null;
  refresh: () => Promise<RoomState | null>;
  navigate: (path: string) => void;
}): WebMcpTool[] {
  if (!state || !code) return [];
  const question = currentQuestion(state);
  const tools: WebMcpTool[] = [
    webMcpTool({
      name: "get_room_state",
      title: "Get room state",
      description: "Read the current SamePage room status, participants, question, and response count.",
      inputSchema: {
        type: "object",
        properties: { code: { type: "string", description: "The 7-character room code." } },
        required: ["code"],
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async (input) => {
        if (String(input.code).toUpperCase() !== code) throw new SamePageError("ROOM_NOT_FOUND");
        const latest = (await refresh()) ?? state;
        return roomStateForAgent(latest);
      },
    }),
  ];

  if (mode === "waiting" && state.room.status === "waiting" && state.currentMember?.member_type === "operator") {
    tools.push(
      webMcpTool({
        name: "start_room",
        title: "Start room",
        description: "Start the waiting SamePage room when its participant requirement is met. Only the room Operator can use this tool.",
        inputSchema: {
          type: "object",
          properties: { code: { type: "string", description: "The 7-character room code." } },
          required: ["code"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (String(input.code).toUpperCase() !== code) throw new SamePageError("ROOM_NOT_FOUND");
          const result = await startRoom(code);
          const next = await refresh();
          const nextPath = actionRoute(result, next, code);
          navigate(nextPath);
          return { ...result, nextRoute: nextPath, startedBy: "agent" };
        },
      }),
    );
  }

  if (mode === "question" && question?.kind === "text") {
    tools.push(
      webMcpTool({
        name: "submit_answer",
        title: "Submit answer",
        description: "Save the current participant's written answer to the active SamePage question.",
        inputSchema: {
          type: "object",
          properties: {
            code: { type: "string", description: "The 7-character room code." },
            question_id: { type: "string", description: "The active question id." },
            answer: { type: "string", description: "The participant's answer." },
          },
          required: ["code", "answer"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (String(input.code).toUpperCase() !== code) throw new SamePageError("ROOM_NOT_FOUND");
          if (input.question_id && String(input.question_id) !== question.id) throw new SamePageError("STALE_QUESTION");
          const result = await submitResponse({
            roomId: state.room.id,
            questionId: question.id,
            answerText: String(input.answer ?? ""),
          });
          const next = await refresh();
          const nextPath = actionRoute(result, next, code);
          navigate(nextPath);
          return { ...result, nextRoute: nextPath };
        },
      }),
    );
  }

  if (mode === "compare" && question) {
    tools.push(
      webMcpTool({
        name: "continue_after_compare",
        title: "Continue after comparison",
        description: "Mark the current comparison as seen and move the room forward when everyone is ready.",
        inputSchema: {
          type: "object",
          properties: { code: { type: "string", description: "The 7-character room code." } },
          required: ["code"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (String(input.code).toUpperCase() !== code) throw new SamePageError("ROOM_NOT_FOUND");
          const result = await acknowledgeCompare(state.room.id, question.id);
          const next = await refresh();
          const nextPath = actionRoute(result, next, code);
          navigate(nextPath);
          return { ...result, nextRoute: nextPath };
        },
      }),
    );
  }

  if (mode === "options" && question?.kind === "choice") {
    tools.push(
      webMcpTool({
        name: "submit_choice",
        title: "Submit choice",
        description: "Save the current participant's selected option for the active SamePage question.",
        inputSchema: {
          type: "object",
          properties: {
            code: { type: "string", description: "The 7-character room code." },
            question_id: { type: "string", description: "The active question id." },
            option_id: { type: "string", description: "The selected option id." },
          },
          required: ["code", "option_id"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (String(input.code).toUpperCase() !== code) throw new SamePageError("ROOM_NOT_FOUND");
          if (input.question_id && String(input.question_id) !== question.id) throw new SamePageError("STALE_QUESTION");
          const result = await submitResponse({
            roomId: state.room.id,
            questionId: question.id,
            optionId: String(input.option_id),
          });
          const next = await refresh();
          const nextPath = actionRoute(result, next, code);
          navigate(nextPath);
          return { ...result, nextRoute: nextPath };
        },
      }),
    );
  }

  if (mode === "meme" && question) {
    tools.push(
      webMcpTool({
        name: "continue_meme",
        title: "Continue past meme",
        description: "Mark the meme break as seen and continue when the room is ready.",
        inputSchema: {
          type: "object",
          properties: { code: { type: "string", description: "The 7-character room code." } },
          required: ["code"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (String(input.code).toUpperCase() !== code) throw new SamePageError("ROOM_NOT_FOUND");
          const result = await acknowledgeMeme(state.room.id, question.id);
          const next = await refresh();
          const nextPath = actionRoute(result, next, code);
          navigate(nextPath);
          return { ...result, nextRoute: nextPath };
        },
      }),
    );
  }

  if (mode === "add-question" && canEditQuestions(state)) {
    tools.push(
      webMcpTool({
        name: "add_question",
        title: "Add question",
        description: "Add a focused text question to the active SamePage room.",
        inputSchema: {
          type: "object",
          properties: {
            code: { type: "string", description: "The 7-character room code." },
            prompt: { type: "string", description: "The new question prompt." },
          },
          required: ["code", "prompt"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (String(input.code).toUpperCase() !== code) throw new SamePageError("ROOM_NOT_FOUND");
          const result = await addQuestion(state.room.id, String(input.prompt ?? ""));
          const next = await refresh();
          const nextPath = actionRoute(result, next, code);
          navigate(nextPath);
          return { ...result, nextRoute: nextPath };
        },
      }),
      webMcpTool({
        name: "skip_question",
        title: "Skip adding question",
        description: "Finish the active SamePage room without adding another question.",
        inputSchema: {
          type: "object",
          properties: { code: { type: "string", description: "The 7-character room code." } },
          required: ["code"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (String(input.code).toUpperCase() !== code) throw new SamePageError("ROOM_NOT_FOUND");
          const result = await skipQuestion(state.room.id);
          const next = await refresh();
          const nextPath = actionRoute(result, next, code);
          navigate(nextPath);
          return { ...result, nextRoute: nextPath };
        },
      }),
    );
  }

  return tools;
}

export function RoomRuntime({ mode }: { mode: RoomRuntimeMode }) {
  const [code, setCode] = useState("");
  useEffect(() => {
    const initialCode = getRoomCodeFromLocation();
    if (!initialCode) return;
    // The room code comes from the client URL. Hydrate the empty state first.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(initialCode);
  }, []);
  const { state, loading, error, refresh } = useRoomState(code);

  useEffect(() => {
    if (!state || loading || !code) return;

    const expectedPath = routeForRoomState(state);
    if (window.location.pathname === expectedPath) return;

    // Room state is authoritative. Realtime updates can move every connected
    // participant to the next phase without requiring a manual refresh.
    window.location.assign(buildRoomHref(expectedPath, code));
  }, [code, loading, state]);

  const navigate = useCallback(
    (path: string) => window.location.assign(path),
    [],
  );
  const webTools = useMemo(
    () => buildWebMcpTools({ mode, code, state, refresh, navigate }),
    [mode, code, state, refresh, navigate],
  );
  const { available: webmcpAvailable } = useWebMcpTools(webTools);
  const copy = PAGE_COPY[mode];
  const backHref = state ? buildRoomHref(BACK_PATHS[mode], code) : "/";

  let content;
  if (!code) content = <MissingRoomCode />;
  else if (loading && !state) content = <LoadingState />;
  else if (error && !state) content = <ErrorState message={error} />;
  else if (!state) content = <ErrorState message="The room could not be loaded." />;
  else if (mode === "waiting") content = <WaitingView state={state} code={code} webmcpAvailable={webmcpAvailable} refresh={refresh} />;
  else if (mode === "question") content = <QuestionView state={state} code={code} refresh={refresh} navigate={navigate} />;
  else if (mode === "compare") content = <CompareView state={state} code={code} refresh={refresh} navigate={navigate} />;
  else if (mode === "options") content = <OptionsView state={state} code={code} refresh={refresh} navigate={navigate} />;
  else if (mode === "meme") content = <MemeView state={state} code={code} refresh={refresh} navigate={navigate} />;
  else if (mode === "add-question") content = <AddQuestionView state={state} code={code} refresh={refresh} navigate={navigate} />;
  else if (mode === "summary") content = <SummaryView state={state} code={code} />;
  else content = <ParticipantsView state={state} code={code} />;

  return (
    <RoomFlowShell
      className={`runtime-${mode}-page`}
      eyebrow={state ? `${state.room.room_name} · ${state.room.code}` : "Same Page room"}
      title={copy.title}
      description={copy.description}
      backHref={backHref}
      backLabel="Back"
    >
      {content}
    </RoomFlowShell>
  );
}

export function UploadAttachmentButton({
  roomId,
  onUploaded,
}: {
  roomId: string;
  onUploaded?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="runtime-attachment-control">
      <input
        className="sr-only"
        id="runtime-attachment"
        type="file"
        accept="application/pdf,text/plain,text/markdown,application/json,image/png,image/jpeg,image/webp"
        disabled={busy}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setMessage(null);
          try {
            await uploadRoomAttachment(roomId, file);
            onUploaded?.();
          } catch (cause) {
            setMessage(getErrorMessage(cause));
          } finally {
            setBusy(false);
            event.target.value = "";
          }
        }}
      />
      <Button className="small-flow-button" variant="outline" type="button" disabled={busy} asChild>
        <label htmlFor="runtime-attachment">{busy ? "Uploading…" : "Upload attachment"}</label>
      </Button>
      {message ? <p className="flow-inline-error" role="alert">{message}</p> : null}
    </div>
  );
}
