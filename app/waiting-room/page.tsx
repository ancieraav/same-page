import type { Metadata } from "next";
import { CopyIcon, LockKeyholeIcon, UsersIcon } from "lucide-react";

import {
  FlowActions,
  FlowPill,
  ParticipantAvatar,
  RoomFlowShell,
} from "@/components/room-flow";
import { Button } from "@/components/ui/button";

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
      <section className="waiting-room-layout" aria-labelledby="waiting-room-title">
        <div className="waiting-room-copy">
          <FlowPill>
            <span className="status-dot" aria-hidden="true" />
            Room is open
          </FlowPill>
          <h2 id="waiting-room-title">Invite your group</h2>
          <p className="waiting-room-lede">
            Everyone can join with this code. The room will start when you are
            ready.
          </p>

          <div className="room-code-panel">
            <div>
              <span className="flow-label">Room code</span>
              <strong>H7K2Q9A</strong>
            </div>
            <Button className="small-flow-button" type="button" variant="outline">
              <CopyIcon aria-hidden="true" />
              Copy code
            </Button>
          </div>

          <div className="waiting-room-meta">
            <span>
              <UsersIcon aria-hidden="true" />
              4 people in the room
            </span>
            <span>
              <LockKeyholeIcon aria-hidden="true" />
              Invite-only
            </span>
          </div>

          <FlowActions
            className="waiting-room-actions"
            secondaryHref="/create-room"
            secondaryLabel="Edit room"
            primaryHref="/question"
            primaryLabel="Start room"
          />
        </div>

        <div className="waiting-room-people" aria-label="People in the room">
          <div className="waiting-room-people-heading">
            <div>
              <span className="flow-label">Participants</span>
              <strong>Everyone is here</strong>
            </div>
            <span className="participant-count">4 / 4</span>
          </div>
          <div className="participant-orbit">
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
        </div>
      </section>
    </RoomFlowShell>
  );
}
