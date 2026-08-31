import Link from "next/link";
import { ArrowRight, Check, FileText, Link2, Sparkles, Users, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Bring the context",
    text: "Paste the brief, drop the chat, or attach the file everyone keeps interpreting differently.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Let an agent ask",
    text: "Your agent sees the room through WebMCP and turns ambiguity into focused questions.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "See the drift",
    text: "Everyone answers privately. SamePage shows the gaps, the overlaps, and what to fix next.",
    icon: Users,
  },
];

export default function Home() {
  return (
    <main className="marketing-page">
      <div className="page-grid" aria-hidden="true" />
      <header className="marketing-header">
        <Link className="brand-lockup" href="/" aria-label="SamePage home">
          <span className="brand-mark" aria-hidden="true"><span /><span /></span>
          <span>SamePage</span>
        </Link>
        <nav className="marketing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#why">Why SamePage</a>
          <Link className="nav-cta" href="/dashboard">Open dashboard <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className="marketing-hero">
        <div className="hero-badge"><span className="status-dot ready" /> Built for the agent-ready web</div>
        <h1>Stop saying<br /><em>“I thought you meant…”</em></h1>
        <p className="marketing-lede">SamePage turns fuzzy conversations into a shared understanding. Create a room, invite the people involved, and let an AI agent find the assumptions hiding between the lines.</p>
        <div className="hero-actions"><Link className="primary-button" href="/dashboard">Create a room <ArrowRight size={18} /></Link><a className="text-link" href="#how-it-works">See how it works <ArrowRight size={15} /></a></div>
        <div className="hero-proof"><div className="proof-avatars"><span>Y</span><span>A</span><span>+</span></div><span>For sellers, buyers, teammates, friends, and groups who need to agree on what “done” means.</span></div>
      </section>

      <section className="demo-window" id="why" aria-label="SamePage product preview">
        <div className="demo-topbar"><div className="window-dots"><span /><span /><span /></div><span className="demo-url">samepage / room / weekend-plans</span><span className="demo-status"><span className="status-dot ready" /> agent connected</span></div>
        <div className="demo-body">
          <div className="demo-sidebar"><div className="demo-sidebar-label">Alignment room</div><strong>Weekend plans</strong><span>2 players · 5 questions</span><div className="demo-sidebar-rule" /><div className="demo-sidebar-label">Room state</div><div className="demo-state"><span className="state-dot lime" /> Waiting for the agent</div><div className="demo-state"><span className="state-dot yellow" /> 0 / 5 answered</div></div>
          <div className="demo-main"><div className="demo-main-label">Question 03 / 05</div><h2>What does “let&apos;s meet at 7” mean?</h2><div className="demo-question-grid"><div className="demo-answer"><span className="answer-tag lavender">You</span><strong>7:00 sharp</strong><span>Already outside, probably.</span></div><div className="demo-answer"><span className="answer-tag butter">Alex</span><strong>7-ish</strong><span>Fashionably late counts.</span></div></div><div className="demo-match"><span>WebMCP comparison</span><strong>Not quite the same page.</strong><span className="mini-x">×</span></div></div>
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="section-kicker"><Zap size={15} /> From context to clarity</div>
        <div className="steps-heading"><h2>Alignment is a<br /><em>workflow, not a vibe.</em></h2><p>SamePage gives the agent a structured way to ask, wait, compare, and explain—while the humans stay in control.</p></div>
        <div className="steps-grid">{steps.map(({ number, title, text, icon: Icon }) => <article className="step-card" key={number}><div className="step-card-top"><span>{number}</span><Icon size={19} /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="closing-cta"><div><span className="section-kicker"><Link2 size={15} /> One link. Everyone aligned.</span><h2>Make the invisible<br /><em>mismatch visible.</em></h2></div><Link className="primary-button" href="/dashboard">Start building a room <ArrowRight size={18} /></Link></section>
      <footer className="marketing-footer"><span>SamePage © 2026</span><span><Check size={14} /> Structured for humans and agents</span></footer>
    </main>
  );
}
