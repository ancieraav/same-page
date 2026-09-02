import type { Metadata } from "next";

import {
  FlowActions,
  FlowPill,
  ParticipantAvatar,
  RoomFlowShell,
} from "@/components/room-flow";

export const metadata: Metadata = {
  title: "Waiting room — Same Page",
  description: "Wait for everyone to join your Same Page room.",
};

const participants = [
  { name: "You", role: "Operator", className: "participant-you" },
  { name: "Maya", role: "Source of truth", className: "participant-maya" },
  { name: "Rafi", role: "Participant", className: "participant-rafi" },
  { name: "Nia", role: "Participant", className: "participant-nia" },
];

export default function WaitingRoomPage() {
  return (
    <RoomFlowShell
      className="waiting-room-page"
      eyebrow="Product critique · Room H7K2Q9A"
      title="Waiting room"
      description="Share the room code and take a moment to get everyone on the same page."
      backHref="/create-room"
      backLabel="Back to create room"
    >
      <section className="waiting-room-stage" aria-labelledby="waiting-room-title">
        <div className="waiting-room-stage-heading">
          <FlowPill>
            <span className="status-dot" aria-hidden="true" />
            Room is open
          </FlowPill>
          <h2 id="waiting-room-title">Everyone is here</h2>
          <p>
            4 people are ready · Room code <strong>H7K2Q9A</strong>
          </p>
        </div>

        <div className="participant-orbit waiting-room-stage-people" aria-label="People in the room">
          <span className="orbit-line orbit-line-one" aria-hidden="true" />
          <span className="orbit-line orbit-line-two" aria-hidden="true" />
          {participants.map((participant) => (
            <div
              className={`participant-bubble ${participant.className}`}
              key={participant.name}
            >
              <ParticipantAvatar name={participant.name} />
              <div>
                <strong>{participant.name}</strong>
                <span>{participant.role}</span>
              </div>
            </div>
          ))}
          <div className="participant-center-mark" aria-hidden="true">
            <span>SP</span>
          </div>
        </div>

        <FlowActions
          className="waiting-room-actions"
          secondaryHref="/create-room"
          secondaryLabel="Leave room"
          primaryHref="/question"
          primaryLabel="Start room"
        />
      </section>
    </RoomFlowShell>
  );
}
