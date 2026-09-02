import type { Metadata } from "next";
import { EyeIcon, MessageCircleIcon } from "lucide-react";

import {
  FlowActions,
  FlowPill,
  ParticipantAvatar,
  RoomFlowShell,
} from "@/components/room-flow";

export const metadata: Metadata = {
  title: "Participant responses — Same Page",
  description: "Review participant responses from a Same Page room.",
};

export default function SeeParticipantPage() {
  return (
    <RoomFlowShell
      className="see-participant-page"
      eyebrow="Product critique · Shared responses"
      title="See other participants"
      description="Keep the full context in view while you learn how the room thinks."
      backHref="/summary"
      backLabel="Back to summary"
    >
      <section className="participant-overview" aria-label="Participant overview">
        <article className="participant-overview-card participant-overview-primary">
          <ParticipantAvatar name="You" />
          <div>
            <span className="flow-label">Your perspective</span>
            <strong>Clear outcome first</strong>
            <span>6 responses · 4 minutes</span>
          </div>
          <FlowPill>Complete</FlowPill>
        </article>
        <article className="participant-overview-card">
          <ParticipantAvatar name="Maya" />
          <div>
            <span className="flow-label">Source of truth</span>
            <strong>Outcome and next step</strong>
            <span>6 responses · 5 minutes</span>
          </div>
          <FlowPill>Complete</FlowPill>
        </article>
      </section>

      <div className="participant-toolbar">
        <div>
          <span className="flow-eyebrow">Response 03 of 06</span>
          <strong>What should everyone understand the same way?</strong>
        </div>
        <div className="participant-toolbar-actions">
          <span className="toolbar-chip">
            <EyeIcon aria-hidden="true" />
            Shared with the room
          </span>
          <button className="toolbar-chip toolbar-chip-button" type="button">
            Filter responses
          </button>
        </div>
      </div>

      <section className="featured-participant-response" aria-labelledby="featured-response-title">
        <div className="featured-response-heading">
          <ParticipantAvatar name="Rafi" className="flow-avatar-large" />
          <div>
            <span className="flow-label">Rafi · Participant</span>
            <h2 id="featured-response-title">The outcome should be visible before the work begins.</h2>
          </div>
          <span className="featured-response-number">03</span>
        </div>
        <p>
          If the team can see what success looks like, we can disagree about the
          route without losing the shared direction. The first step is making
          that outcome concrete.
        </p>
        <div className="featured-response-footer">
          <span>
            <MessageCircleIcon aria-hidden="true" />
            2 connections
          </span>
          <span>Answered 2 min ago</span>
        </div>
      </section>

      <section className="participant-response-list" aria-labelledby="other-responses-title">
        <div className="summary-section-heading">
          <div>
            <span className="flow-eyebrow">More perspectives</span>
            <h2 id="other-responses-title">The room is converging</h2>
          </div>
          <span className="summary-section-count">3 responses</span>
        </div>
        <div className="participant-response-row">
          <ParticipantAvatar name="Nia" />
          <div>
            <strong>Nia</strong>
            <p>Start with the decision we need to make, not the feature we want to build.</p>
          </div>
          <span>01 connection</span>
        </div>
        <div className="participant-response-row">
          <ParticipantAvatar name="Maya" />
          <div>
            <strong>Maya</strong>
            <p>Make it easy for the next person to understand why this direction matters.</p>
          </div>
          <span>02 connections</span>
        </div>
      </section>

      <FlowActions
        className="participant-bottom-actions"
        secondaryHref="/summary"
        secondaryLabel="Back to summary"
        primaryHref="/"
        primaryLabel="Finish room"
      />
    </RoomFlowShell>
  );
}
