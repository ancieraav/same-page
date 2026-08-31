"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  LoaderCircle,
  MessageCircleQuestion,
  RefreshCw,
  Share2,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { RoomComparison, RoomQuestion, RoomSnapshot } from "../../../lib/room-types";

type WebMCPTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (input: unknown, context?: { signal?: AbortSignal }) => unknown;
};

type ModelContext = {
  registerTool: (tool: WebMCPTool, options?: { signal?: AbortSignal }) => Promise<void>;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

const tokenKey = (roomId: string) => `samepage:player:${roomId}`;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function statusLabel(status: RoomSnapshot["status"]) {
  if (status === "asking") return "Agent is asking";
  if (status === "live") return "Round live";
  if (status === "complete") return "Round complete";
  return "Waiting for agent";
}

function defaultMeme(score: number) {
  if (score >= 80) return "same brain. same page. suspiciously efficient. 🤝";
  if (score >= 60) return "mostly aligned. one tab is still loading. 🫡";
  if (score >= 40) return "this is not even same💀";
  return "different universes. same group chat. 🌌";
}

function getScore(comparison: RoomComparison[]) {
  if (!comparison.length) return 0;
  return Math.round((comparison.filter((item) => item.match).length / comparison.length) * 100);
}

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();
  const roomId = String(params.roomId ?? "").toUpperCase();
  const isHost = searchParams.get("host") === "1";
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agentMessage, setAgentMessage] = useState("Waiting for a WebMCP agent call…");
  const [webmcpStatus, setWebmcpStatus] = useState<"checking" | "ready" | "fallback">("checking");
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerToken, setPlayerToken] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedQuestionId, setSubmittedQuestionId] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const roomRef = useRef<RoomSnapshot | null>(null);

  const loadRoom = useCallback(async (showLoader = false) => {
    if (!roomId) return;
    if (showLoader) setLoading(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}`, { cache: "no-store" });
      const payload = (await response.json()) as { room?: RoomSnapshot; error?: string };
      if (!response.ok || !payload.room) throw new Error(payload.error || "Room not found");
      roomRef.current = payload.room;
      setRoom(payload.room);
      setError("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load room");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    // The first fetch hydrates the room from D1; subsequent calls keep shared links in sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRoom(true);
    const interval = window.setInterval(() => void loadRoom(), 3_500);
    return () => window.clearInterval(interval);
  }, [loadRoom]);

  useEffect(() => {
    const saved = window.localStorage.getItem(tokenKey(roomId));
    if (!saved) return;
    try {
      const data = JSON.parse(saved) as { token?: string; name?: string };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (data.token) setPlayerToken(data.token);
      if (data.name) setPlayerName(data.name);
    } catch {
      window.localStorage.removeItem(tokenKey(roomId));
    }
  }, [roomId]);

  const currentQuestion = useMemo<RoomQuestion | null>(() => {
    if (!room?.questions.length) return null;
    return room.questions[Math.min(room.currentQuestionIndex, room.questions.length - 1)] ?? null;
  }, [room]);

  useEffect(() => {
    // Reset the answer state when the agent moves to a new question.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswer("");
    setSubmittedQuestionId("");
    setSecondsLeft((room?.timerMinutes ?? 5) * 60);
  }, [currentQuestion?.id, room?.timerMinutes]);

  const activeQuestionId = currentQuestion?.id;
  const roomStatus = room?.status;
  useEffect(() => {
    if (!activeQuestionId || (roomStatus !== "asking" && roomStatus !== "live")) return;
    const timer = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [activeQuestionId, roomStatus]);

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext?.registerTool || !roomId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWebmcpStatus("fallback");
      return;
    }

    const controller = new AbortController();
    const getSnapshot = () => {
      const current = roomRef.current;
      return current ? {
        roomId: current.id,
        title: current.title,
        context: current.context,
        config: {
          playerCount: current.playerCount,
          timerMinutes: current.timerMinutes,
          memeEnabled: current.memeEnabled,
        },
        status: current.status,
        currentQuestionIndex: current.currentQuestionIndex,
        questions: current.questions,
        players: current.players,
        files: current.files,
      } : { roomId, error: "Room has not loaded yet" };
    };

    async function patchRoom(payload: Record<string, unknown>) {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { room?: RoomSnapshot; error?: string };
      if (!response.ok || !data.room) throw new Error(data.error || "Could not update room");
      roomRef.current = data.room;
      setRoom(data.room);
      return data.room;
    }

    const tools: WebMCPTool[] = [
      {
        name: "get_room_context",
        description: "Read a SamePage room's discussion context, settings, files, players, questions, and current state before asking questions.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: true },
        execute: () => getSnapshot(),
      },
      {
        name: "create_room_questions",
        description: "Create the focused questions the agent wants every room player to answer. Each question can include multiple-choice options or be open-ended.",
        inputSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: { id: { type: "string" }, prompt: { type: "string" }, helper: { type: "string" }, options: { type: "array", items: { type: "string" } } },
                required: ["id", "prompt"],
              },
            },
          },
          required: ["questions"],
        },
        annotations: { readOnlyHint: false },
        execute: async (rawInput) => {
          const input = (rawInput ?? {}) as { questions?: RoomQuestion[] };
          const questions = (input.questions ?? []).slice(0, 20).map((question, index) => ({
            id: question.id?.slice(0, 80) || `question-${index + 1}`,
            prompt: question.prompt?.slice(0, 500) || `Question ${index + 1}`,
            helper: question.helper?.slice(0, 300),
            options: Array.isArray(question.options) ? question.options.slice(0, 8).map((option) => String(option).slice(0, 180)) : [],
          }));
          if (!questions.length) return { ok: false, error: "At least one question is required." };
          const nextRoom = await patchRoom({ questions, currentQuestionIndex: 0, status: "asking" });
          setAgentMessage(`Agent created ${questions.length} question${questions.length === 1 ? "" : "s"}. Waiting for everyone to answer.`);
          return { ok: true, roomId: nextRoom.id, questionCount: questions.length, status: nextRoom.status };
        },
      },
      {
        name: "advance_room_question",
        description: "Move a SamePage room to a question index after the current question's answers are collected, or mark the round live.",
        inputSchema: {
          type: "object",
          properties: { questionIndex: { type: "number" }, status: { type: "string", enum: ["asking", "live", "complete"] } },
          required: ["questionIndex"],
        },
        annotations: { readOnlyHint: false },
        execute: async (rawInput) => {
          const input = (rawInput ?? {}) as { questionIndex?: number; status?: "asking" | "live" | "complete" };
          const nextRoom = await patchRoom({ currentQuestionIndex: Math.max(0, Math.floor(input.questionIndex ?? 0)), status: input.status ?? "live" });
          setAgentMessage(`Round moved to question ${nextRoom.currentQuestionIndex + 1}.`);
          return { ok: true, currentQuestionIndex: nextRoom.currentQuestionIndex, status: nextRoom.status };
        },
      },
      {
        name: "get_room_responses",
        description: "Read all answers submitted by the room players, grouped by question, so the agent can compare their understanding.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: true },
        execute: async () => {
          const response = await fetch(`/api/rooms/${roomId}/answers`, { cache: "no-store" });
          const payload = (await response.json()) as { answers?: unknown[]; error?: string };
          if (!response.ok) throw new Error(payload.error || "Could not load responses");
          return { roomId, answers: payload.answers ?? [] };
        },
      },
      {
        name: "finalize_samepage_room",
        description: "Finish the SamePage room with the agent's comparison notes and a concise summary of how each player's understanding differed. Include memeText only when the room allows memes.",
        inputSchema: {
          type: "object",
          properties: {
            comparison: { type: "array", items: { type: "object" } },
            summary: { type: "string" },
            memeText: { type: "string" },
          },
          required: ["comparison", "summary"],
        },
        annotations: { readOnlyHint: false },
        execute: async (rawInput) => {
          const input = (rawInput ?? {}) as { comparison?: RoomComparison[]; summary?: string; memeText?: string };
          const comparison = Array.isArray(input.comparison) ? input.comparison.slice(0, 30) : [];
          const nextRoom = await patchRoom({ status: "complete", comparison, summary: input.summary ?? "", memeText: input.memeText ?? "" });
          setAgentMessage("Agent finished the comparison and wrote the room summary.");
          return { ok: true, roomId: nextRoom.id, status: nextRoom.status, comparisonCount: nextRoom.comparison.length };
        },
      },
    ];

    Promise.all(tools.map((tool) => modelContext.registerTool(tool, { signal: controller.signal })))
      .then(() => setWebmcpStatus("ready"))
      .catch(() => setWebmcpStatus("fallback"));
    return () => controller.abort();
  }, [roomId]);

  async function copyShareLink() {
    const link = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_800);
    } catch {
      setCopied(false);
    }
  }

  async function joinRoom() {
    if (!playerName.trim()) {
      setJoinError("Enter a name so the room knows who answered.");
      return;
    }
    setJoining(true);
    setJoinError("");
    try {
      const response = await fetch(`/api/rooms/${roomId}/players`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: playerName.trim() }) });
      const payload = (await response.json()) as { player?: { token: string; name: string }; error?: string };
      if (!response.ok || !payload.player) throw new Error(payload.error || "Could not join room");
      setPlayerToken(payload.player.token);
      setPlayerName(payload.player.name);
      window.localStorage.setItem(tokenKey(roomId), JSON.stringify({ token: payload.player.token, name: payload.player.name }));
      void loadRoom();
    } catch (caughtError) {
      setJoinError(caughtError instanceof Error ? caughtError.message : "Could not join room");
    } finally {
      setJoining(false);
    }
  }

  async function submitAnswer() {
    if (!playerToken || !currentQuestion || !answer.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}/answers`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ playerToken, questionId: currentQuestion.id, answer: answer.trim() }) });
      const payload = (await response.json()) as { room?: RoomSnapshot; error?: string };
      if (!response.ok || !payload.room) throw new Error(payload.error || "Could not submit answer");
      setSubmittedQuestionId(currentQuestion.id);
      setRoom(payload.room);
      roomRef.current = payload.room;
    } catch (caughtError) {
      setJoinError(caughtError instanceof Error ? caughtError.message : "Could not submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  const score = room ? getScore(room.comparison) : 0;
  const meme = room?.memeText || defaultMeme(score);
  const answeredPlayers = room?.players.filter((player) => player.answerCount > 0).length ?? 0;

  if (loading) return <main className="room-loading"><LoaderCircle className="spin" size={26} /><span>Opening room {roomId}…</span></main>;
  if (error || !room) return <main className="room-loading"><div className="room-error"><X size={25} /><h1>Room unavailable</h1><p>{error || "This room does not exist."}</p><Link className="secondary-button" href="/dashboard"><ArrowLeft size={16} /> Back to dashboard</Link></div></main>;

  return (
    <main className="room-page">
      <div className="page-grid" aria-hidden="true" />
      <header className="room-topbar"><Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true"><span /><span /></span><span>SamePage</span></Link><div className="room-top-actions"><span className={`room-live-pill ${webmcpStatus === "ready" ? "ready" : ""}`}><span className="status-dot" /> {webmcpStatus === "ready" ? "WebMCP live" : "Agent preview"}</span>{isHost && <button className="secondary-button compact" onClick={copyShareLink}>{copied ? <Check size={15} /> : <Share2 size={15} />} {copied ? "Copied" : "Share room"}</button>}<Link className="room-dashboard-link" href="/dashboard"><ArrowLeft size={15} /> Dashboard</Link></div></header>

      <section className="room-shell">
        <div className="room-main-column">
          <div className="room-heading"><div><div className="room-id"><span className="room-id-dot" /> ROOM {room.id}</div><h1>{room.title}</h1><p>{room.context}</p></div><div className={`status-badge ${room.status}`}><span /> {statusLabel(room.status)}</div></div>

          {isHost ? <HostRoom room={room} agentMessage={agentMessage} score={score} meme={meme} answeredPlayers={answeredPlayers} onCopy={copyShareLink} copied={copied} /> : <PlayerRoom room={room} playerToken={playerToken} playerName={playerName} setPlayerName={setPlayerName} joining={joining} joinError={joinError} joinRoom={joinRoom} currentQuestion={currentQuestion} answer={answer} setAnswer={setAnswer} submitAnswer={submitAnswer} submitting={submitting} submittedQuestionId={submittedQuestionId} secondsLeft={secondsLeft} score={score} meme={meme} />}
        </div>

        <aside className="room-side-column">
          <div className="side-card room-config-card"><div className="side-card-title"><SettingsGlyph /> Room setup</div><div className="config-list"><div><Users size={16} /><span>Players</span><strong>{room.players.length} / {room.playerCount}</strong></div><div><Clock3 size={16} /><span>Timer</span><strong>{room.timerMinutes} min / question</strong></div><div><Sparkles size={16} /><span>Meme verdicts</span><strong>{room.memeEnabled ? "On" : "Off"}</strong></div></div></div>
          <div className="side-card players-card"><div className="side-card-title"><Users size={16} /> Players <span>{room.players.length}</span></div>{room.players.length === 0 ? <p className="side-empty">Share the link to invite the first player.</p> : <div className="player-list">{room.players.map((player) => <div className="player-row" key={player.id}><span className={player.seat % 2 === 0 ? "player-avatar butter" : "player-avatar lavender"}>{player.name.slice(0, 1).toUpperCase()}</span><div><strong>{player.name}</strong><span>Seat {player.seat} · {player.answerCount} answered</span></div>{player.answerCount > 0 && <CheckCircle2 size={16} />}</div>)}</div>}</div>
          <div className="side-card files-card"><div className="side-card-title"><FileText size={16} /> Context files <span>{room.files.length}</span></div>{room.files.length === 0 ? <p className="side-empty">No files attached.</p> : <div className="file-summary-list">{room.files.map((file) => <div key={file.id}><FileText size={15} /><span>{file.filename}</span></div>)}</div>}</div>
          <div className="side-card webmcp-card"><div className="webmcp-card-icon"><Zap size={17} /></div><span className="mini-label">Agent handoff</span><h3>Waiting is a feature.</h3><p>SamePage stays quiet until the agent calls the room tools. That is how everyone gets the same questions and the comparison has real context.</p><div className="agent-event"><span className="event-dot" /> {agentMessage}</div></div>
        </aside>
      </section>
    </main>
  );
}

function SettingsGlyph() {
  return <span className="settings-glyph"><span /><span /><span /></span>;
}

function HostRoom({ room, agentMessage, score, meme, answeredPlayers, onCopy, copied }: { room: RoomSnapshot; agentMessage: string; score: number; meme: string; answeredPlayers: number; onCopy: () => void; copied: boolean }) {
  if (room.status === "complete") {
    return <section className="host-result"><div className="host-result-top"><div><span className="eyebrow"><Sparkles size={15} /> Agent readout complete</span><h2>The room is on <em>{score}%</em> the same page.</h2><p>{room.summary || "The agent finished without adding a written summary."}</p></div><div className="room-score-small"><strong>{score}%</strong><span>match</span></div></div>{room.memeEnabled && <div className="room-meme"><span className="meme-stamp">Meme verdict</span><strong>{meme}</strong></div>}<ComparisonList comparison={room.comparison} /></section>;
  }
  return <section className="host-waiting"><div className="agent-waiting-hero"><div className="waiting-orbit"><Sparkles size={22} /></div><div><span className="mini-label">The room is ready</span><h2>{room.status === "waiting" ? "Waiting for the agent to start asking." : "The agent is running the questions."}</h2><p>{room.status === "waiting" ? "Share the link, then ask your WebMCP-enabled agent to read this room and create its questions." : "Everyone answers independently. We will keep the state here as they submit."}</p></div></div><div className="agent-instructions"><div className="instruction-step"><span>01</span><div><strong>Share the link</strong><p>Send it to every seller, buyer, or teammate involved.</p></div><button className="icon-button" onClick={onCopy}>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div><div className="instruction-step"><span>02</span><div><strong>Ask your agent to inspect the room</strong><p>It can call <code>get_room_context</code> and <code>create_room_questions</code>.</p></div></div><div className="instruction-step"><span>03</span><div><strong>Watch the answers arrive</strong><p>{answeredPlayers} of {room.players.length || room.playerCount} joined players have answered at least once.</p></div></div></div>{room.questions.length > 0 && <div className="question-preview"><div className="section-heading-row"><div><span className="mini-label">Agent questions</span><h3>{room.questions.length} ready to run</h3></div><span className="status-badge asking"><span /> {agentMessage}</span></div>{room.questions.map((question, index) => <div className="question-preview-row" key={question.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{question.prompt}</strong>{question.options?.length ? <small>{question.options.length} options</small> : <small>Open answer</small>}</div>)}</div>}</section>;
}

function PlayerRoom({ room, playerToken, playerName, setPlayerName, joining, joinError, joinRoom, currentQuestion, answer, setAnswer, submitAnswer, submitting, submittedQuestionId, secondsLeft, score, meme }: { room: RoomSnapshot; playerToken: string; playerName: string; setPlayerName: (value: string) => void; joining: boolean; joinError: string; joinRoom: () => void; currentQuestion: RoomQuestion | null; answer: string; setAnswer: (value: string) => void; submitAnswer: () => void; submitting: boolean; submittedQuestionId: string; secondsLeft: number; score: number; meme: string }) {
  if (!playerToken) return <section className="join-card"><div className="join-icon"><Users size={22} /></div><span className="mini-label">You were invited</span><h2>Join this alignment room.</h2><p>Choose a name, then answer the same questions as everyone else. Your answers stay private until the agent compares them.</p><div className="join-form"><label htmlFor="player-name">Your name</label><input id="player-name" value={playerName} onChange={(event) => setPlayerName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") joinRoom(); }} placeholder="e.g. Alex" autoFocus /><button className="primary-button" onClick={joinRoom} disabled={joining}>{joining ? <><LoaderCircle className="spin" size={17} /> Joining…</> : <>Join room <ArrowRight size={18} /></>}</button></div>{joinError && <p className="form-error" role="alert">{joinError}</p>}</section>;
  if (room.status === "complete") return <section className="player-result"><div className="eyebrow"><Sparkles size={15} /> The room is complete</div><h2>You were <em>{score}%</em> on the same page.</h2>{room.memeEnabled && <div className="room-meme"><span className="meme-stamp">The verdict</span><strong>{meme}</strong></div>}<div className="summary-card"><span className="mini-label">Agent summary</span><p>{room.summary || "No summary was added."}</p></div><ComparisonList comparison={room.comparison} /></section>;
  if (!currentQuestion) return <section className="player-waiting"><div className="waiting-orbit"><MessageCircleQuestion size={24} /></div><span className="mini-label">You are in</span><h2>Waiting for the agent to ask.</h2><p>The room has your name. Once the agent creates the questions, they will appear here automatically.</p><div className="waiting-pulse"><span /><span /><span /></div></section>;
  const selected = Boolean(answer.trim());
  return <section className="answer-card"><div className="answer-card-top"><div><span className="question-number">Question {String(room.currentQuestionIndex + 1).padStart(2, "0")} / {room.questions.length}</span><span className="answer-card-helper">Answer as {playerName}</span></div><div className={secondsLeft < 30 ? "timer urgent" : "timer"}><Clock3 size={15} /> {formatTime(secondsLeft)}</div></div><h2>{currentQuestion.prompt}</h2>{currentQuestion.helper && <p className="question-helper">{currentQuestion.helper}</p>}{currentQuestion.options?.length ? <div className="room-options">{currentQuestion.options.map((option) => <button className={answer === option ? "room-option selected" : "room-option"} key={option} onClick={() => setAnswer(option)}><span className="option-dot" />{option}{answer === option && <Check size={17} />}</button>)}</div> : <textarea className="answer-textarea" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write what you actually understand…" rows={6} />}
    <div className="answer-submit-row"><span>{submittedQuestionId === currentQuestion.id ? <><CheckCircle2 size={15} /> Submitted. You can update it before the round moves on.</> : "Your answer is only shared after you submit."}</span><button className="primary-button" onClick={submitAnswer} disabled={!selected || submitting}>{submitting ? <><LoaderCircle className="spin" size={17} /> Sending…</> : submittedQuestionId === currentQuestion.id ? <>Update answer <RefreshCw size={17} /></> : <>Submit answer <ArrowRight size={17} /></>}</button></div>{joinError && <p className="form-error" role="alert">{joinError}</p>}</section>;
}

function ComparisonList({ comparison }: { comparison: RoomComparison[] }) {
  if (!comparison.length) return null;
  return <div className="comparison-list"><div className="mini-label">Where the understanding drifted</div>{comparison.map((item, index) => <div className={item.match ? "comparison-row match" : "comparison-row"} key={`${item.questionId}-${index}`}><span className="comparison-index">{String(index + 1).padStart(2, "0")}</span><div><strong>{item.prompt}</strong><p>{item.note}</p></div><span className="comparison-status">{item.match ? <><Check size={14} /> aligned</> : <><X size={14} /> gap found</>}</span></div>)}</div>;
}
