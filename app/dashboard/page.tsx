"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  FolderOpen,
  Gauge,
  Link2,
  LoaderCircle,
  Plus,
  Settings2,
  Sparkles,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { RoomSnapshot } from "../../lib/room-types";

const ROOM_IDS_KEY = "samepage:room-ids";

type FormState = {
  title: string;
  context: string;
  playerCount: string;
  timerMinutes: string;
  memeEnabled: boolean;
};

const initialForm: FormState = {
  title: "",
  context: "",
  playerCount: "2",
  timerMinutes: "5",
  memeEnabled: true,
};

function statusLabel(status: RoomSnapshot["status"]) {
  if (status === "asking") return "Agent is asking";
  if (status === "live") return "Live round";
  if (status === "complete") return "Complete";
  return "Waiting for agent";
}

export default function Dashboard() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [rooms, setRooms] = useState<RoomSnapshot[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadRooms = useCallback(async () => {
    if (typeof window === "undefined") return;
    const ids = JSON.parse(window.localStorage.getItem(ROOM_IDS_KEY) ?? "[]") as string[];
    if (!ids.length) {
      setRooms([]);
      setLoadingRooms(false);
      return;
    }
    try {
      const response = await fetch(`/api/rooms?ids=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" });
      const payload = (await response.json()) as { rooms?: RoomSnapshot[] };
      setRooms(payload.rooms ?? []);
    } catch {
      setError("Could not load your rooms. You can still create a new one.");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    // The initial fetch synchronizes this client view with the durable room list.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRooms();
    const interval = window.setInterval(() => void loadRooms(), 8_000);
    return () => window.clearInterval(interval);
  }, [loadRooms]);

  const stats = useMemo(() => ({
    total: rooms.length,
    waiting: rooms.filter((room) => room.status === "waiting" || room.status === "asking").length,
    players: rooms.reduce((sum, room) => sum + room.players.length, 0),
  }), [rooms]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setFiles((current) => [...current, ...selected].slice(0, 5));
    event.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          context: form.context,
          playerCount: Number(form.playerCount),
          timerMinutes: Number(form.timerMinutes),
          memeEnabled: form.memeEnabled,
        }),
      });
      const payload = (await response.json()) as { room?: RoomSnapshot; error?: string };
      if (!response.ok || !payload.room) throw new Error(payload.error || "Could not create room");

      for (const file of files) {
        const upload = new FormData();
        upload.append("file", file);
        await fetch(`/api/rooms/${payload.room.id}/files`, { method: "POST", body: upload });
      }

      const previousIds = JSON.parse(window.localStorage.getItem(ROOM_IDS_KEY) ?? "[]") as string[];
      window.localStorage.setItem(ROOM_IDS_KEY, JSON.stringify([payload.room.id, ...previousIds.filter((id) => id !== payload.room?.id)].slice(0, 12)));
      router.push(`/room/${payload.room.id}?host=1`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create room");
      setCreating(false);
    }
  }

  return (
    <main className="dashboard-page">
      <div className="page-grid" aria-hidden="true" />
      <aside className="dashboard-sidebar">
        <Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true"><span /><span /></span><span>SamePage</span></Link>
        <div className="sidebar-label">Workspace</div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation"><Link className="active" href="/dashboard"><Gauge size={17} /> Overview</Link><a href="#rooms"><Link2 size={17} /> My rooms <span>{rooms.length}</span></a><a href="#how-agent-works"><Sparkles size={17} /> Agent handoff</a></nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-callout"><div className="sidebar-callout-icon"><Zap size={15} /></div><strong>WebMCP ready</strong><span>Your room waits for the agent to ask the right questions.</span></div>
        <Link className="sidebar-home" href="/"><ArrowRight size={15} /> Back to landing</Link>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar"><div><span className="dashboard-kicker">Alignment workspace</span><h1>Good morning, Verttra.</h1></div><div className="dashboard-top-actions"><div className="tool-pill"><span className="status-dot ready" /> WebMCP connected</div><span className="dashboard-avatar">V</span></div></header>

        <div className="dashboard-grid">
          <section className="dashboard-intro"><div><span className="eyebrow"><Sparkles size={15} /> Make ambiguity answerable</span><h2>Build a room.<br /><em>Find the mismatch.</em></h2><p>Give your agent the context. It handles the questions; everyone else just answers honestly.</p></div><div className="intro-decoration" aria-hidden="true"><span /><span /><span /><i>?</i></div></section>

          <section className="stats-row" aria-label="Room statistics"><div className="stat-card"><span className="stat-label">Rooms created</span><strong>{stats.total}</strong><span className="stat-detail">on this device</span></div><div className="stat-card"><span className="stat-label">Waiting on agent</span><strong>{stats.waiting}</strong><span className="stat-detail">ready for questions</span></div><div className="stat-card"><span className="stat-label">Players joined</span><strong>{stats.players}</strong><span className="stat-detail">across your rooms</span></div></section>

          <section className="create-room-card" id="new-room">
            <div className="create-card-heading"><div><span className="mini-label">New alignment room</span><h2>Set the context first.</h2><p>The agent cannot ask a useful question without knowing what everyone is discussing.</p></div><div className="create-card-number">01</div></div>
            <form onSubmit={createRoom}>
              <div className="form-field"><label htmlFor="room-title">Room name</label><input id="room-title" required value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="e.g. Seller × Buyer — homepage scope" /></div>
              <div className="form-field"><label htmlFor="room-context">Context of the discussion</label><textarea id="room-context" required value={form.context} onChange={(event) => updateForm("context", event.target.value)} placeholder="Paste the brief, chat, proposal, or explain what both sides need to agree on…" rows={5} /><span className="field-help">This is shared with the agent and room players.</span></div>

              <div className="form-field"><label>Attach supporting files <span className="optional">optional</span></label><label className="file-drop" htmlFor="room-files"><Upload size={18} /><span><strong>Drop files here or browse</strong><small>PDF, DOCX, TXT, PNG · up to 10 MB each</small></span><input id="room-files" type="file" multiple onChange={addFiles} /></label>{files.length > 0 && <div className="file-list">{files.map((file, index) => <div className="file-chip" key={`${file.name}-${index}`}><FileText size={15} /><span>{file.name}</span><button type="button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}><X size={14} /></button></div>)}</div>}</div>

              <div className="settings-heading"><Settings2 size={16} /> Room settings</div>
              <div className="settings-grid"><div className="form-field"><label htmlFor="player-count">Players</label><div className="select-wrap"><Users size={15} /><select id="player-count" value={form.playerCount} onChange={(event) => updateForm("playerCount", event.target.value)}><option value="2">2 people</option><option value="3">3 people</option><option value="4">4 people</option><option value="5">5 people</option><option value="6">6 people</option><option value="8">8 people</option><option value="10">10 people</option><option value="12">12 people</option></select><ChevronDown size={15} /></div></div><div className="form-field"><label htmlFor="timer">Time per question</label><div className="select-wrap"><Gauge size={15} /><select id="timer" value={form.timerMinutes} onChange={(event) => updateForm("timerMinutes", event.target.value)}><option value="2">2 minutes</option><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option></select><ChevronDown size={15} /></div></div><div className="form-field toggle-field"><label htmlFor="meme-toggle">Meme verdicts</label><button id="meme-toggle" type="button" role="switch" aria-checked={form.memeEnabled} className={form.memeEnabled ? "toggle on" : "toggle"} onClick={() => updateForm("memeEnabled", !form.memeEnabled)}><span /></button><span className="field-help">{form.memeEnabled ? "Bring on the chaos." : "Keep it strictly professional."}</span></div></div>

              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-submit-row"><span><Link2 size={15} /> You will get a shareable room link.</span><button className="primary-button" type="submit" disabled={creating}>{creating ? <><LoaderCircle className="spin" size={17} /> Creating room…</> : <>Create room <ArrowRight size={18} /></>}</button></div>
            </form>
          </section>

          <section className="rooms-section" id="rooms"><div className="section-heading-row"><div><span className="mini-label">Your rooms</span><h2>Recent alignments</h2></div><a className="subtle-link" href="#new-room"><Plus size={16} /> New room</a></div>{loadingRooms ? <div className="rooms-empty"><LoaderCircle className="spin" size={20} /> Loading rooms…</div> : rooms.length === 0 ? <div className="rooms-empty"><FolderOpen size={22} /><div><strong>No rooms yet.</strong><span>Your first room will show up here.</span></div><a href="#new-room" className="secondary-button">Create one <ArrowRight size={16} /></a></div> : <div className="room-list">{rooms.map((room) => <Link className="room-row" href={`/room/${room.id}?host=1`} key={room.id}><div className="room-row-icon"><Users size={17} /></div><div className="room-row-main"><strong>{room.title}</strong><span>{room.id} · {room.players.length}/{room.playerCount} players · {room.questions.length || "Waiting for"} {room.questions.length === 1 ? "question" : "questions"}</span></div><span className={`room-status ${room.status}`}><i /> {statusLabel(room.status)}</span><ArrowRight size={17} className="room-arrow" /></Link>)}</div>}</section>

          <section className="agent-handoff" id="how-agent-works"><div className="handoff-icon"><Sparkles size={18} /></div><div><span className="mini-label">After you create the room</span><h2>The dashboard waits for your agent.</h2><p>Share the room link. When your WebMCP-enabled agent calls the room tools, it can read the context, create questions, move the round forward, inspect responses, and finalize the shared-understanding summary.</p></div><div className="handoff-tools"><span>read context</span><span>ask questions</span><span>compare answers</span><span>write summary</span></div></section>
        </div>
      </section>
    </main>
  );
}
