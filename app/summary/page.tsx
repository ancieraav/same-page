import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon, CheckIcon, Clock3Icon, UsersIcon } from "lucide-react";

import {
  FlowActions,
  FlowPill,
  ParticipantAvatar,
  RoomFlowShell,
} from "@/components/room-flow";

export const metadata: Metadata = {
  title: "Room summary — Same Page",
  description: "Review the outcome of a Same Page room.",
};

const themes = [
  {
    title: "Make the outcome visible",
    description: "Keep the decision and its reason together so the next person can pick it up quickly.",
    accent: "summary-theme-green",
  },
  {
    title: "Give people a starting point",
    description: "A focused prompt helped each answer move beyond a first reaction.",
    accent: "summary-theme-yellow",
  },
  {
    title: "Close the loop",
    description: "End with an owner and a next step while the shared context is fresh.",
    accent: "summary-theme-lilac",
  },
];

export default function SummaryPage() {
  return (
    <RoomFlowShell
      className="summary-page"
      eyebrow="Product critique · Finished"
      title="Room summary"
      description="A calm recap of what the room noticed, agreed on, and can do next."
      backHref="/add-question"
      backLabel="Back to add question"
    >
      <section className="summary-overview" aria-label="Room overview">
        <div className="summary-stat-card">
          <span className="flow-label">Room</span>
          <strong>Product critique</strong>
          <span>H7K2Q9A · Today</span>
        </div>
        <div className="summary-stat-card">
          <span className="flow-label">Participation</span>
          <strong>4 people</strong>
          <span>
            <UsersIcon aria-hidden="true" /> Everyone answered
          </span>
        </div>
      </section>

      <section className="summary-hero" aria-labelledby="summary-hero-title">
        <div className="summary-hero-score">
          <span>Shared clarity</span>
          <strong>82%</strong>
          <span className="summary-score-delta">↑ 14% from the start</span>
        </div>
        <div className="summary-hero-copy">
          <FlowPill>
            <CheckIcon aria-hidden="true" />
            Strong alignment
          </FlowPill>
          <h2 id="summary-hero-title">The room left with a clearer next step.</h2>
          <p>
            Four perspectives converged on making the outcome explicit before
            the team starts exploring solutions.
          </p>
        </div>
      </section>

      <FlowActions
        className="summary-centered-action"
        primaryHref="/see-participant"
        primaryLabel="See participant responses"
      />

      <section className="summary-section" aria-labelledby="summary-patterns-title">
        <div className="summary-section-heading">
          <div>
            <span className="flow-eyebrow">What the room found</span>
            <h2 id="summary-patterns-title">Three patterns to carry forward</h2>
          </div>
          <span className="summary-section-count">03 themes</span>
        </div>
        <div className="summary-theme-grid">
          {themes.map((theme, index) => (
            <article className={`summary-theme-card ${theme.accent}`} key={theme.title}>
              <span className="summary-theme-number">0{index + 1}</span>
              <h3>{theme.title}</h3>
              <p>{theme.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="summary-section summary-reflection" aria-labelledby="summary-reflection-title">
        <div className="summary-section-heading">
          <div>
            <span className="flow-eyebrow">Room reflection</span>
            <h2 id="summary-reflection-title">What happens next?</h2>
          </div>
          <Clock3Icon aria-hidden="true" />
        </div>
        <div className="summary-reflection-grid">
          <article>
            <span className="flow-label">Decision</span>
            <strong>Make the outcome visible in the project brief.</strong>
          </article>
          <article>
            <span className="flow-label">Owner</span>
            <strong>
              <ParticipantAvatar name="Maya" /> Maya will share the recap.
            </strong>
          </article>
        </div>
      </section>

      <div className="summary-bottom-actions">
        <FlowPill>Room recap is ready</FlowPill>
        <Link className="text-action" href="/">
          Leave room
          <ArrowUpRightIcon aria-hidden="true" />
        </Link>
      </div>
    </RoomFlowShell>
  );
}
