import type { Metadata } from "next";
import { CheckIcon, MessageCircleIcon } from "lucide-react";

import {
  FlowActions,
  FlowPill,
  ParticipantAvatar,
  RoomFlowShell,
} from "@/components/room-flow";

export const metadata: Metadata = {
  title: "Compare answers — Same Page",
  description: "Compare two perspectives in a Same Page room.",
};

export default function QuestionTwoPage() {
  return (
    <RoomFlowShell
      className="question-two-page"
      eyebrow="Product critique · Question 1 of 6"
      title="Compare responses"
      description="Take in both perspectives before the room moves to the next prompt."
      backHref="/question"
      backLabel="Back to question"
    >
      <section className="compare-stage" aria-labelledby="compare-prompt">
        <div className="compare-stage-heading">
          <FlowPill>
            <CheckIcon aria-hidden="true" />
            Everyone has answered
          </FlowPill>
          <h2 id="compare-prompt">What stood out in each answer?</h2>
        </div>

        <div className="response-comparison">
          <article className="response-card response-card-primary">
            <div className="response-card-heading">
              <ParticipantAvatar name="You" />
              <div>
                <strong>You</strong>
                <span>Your response</span>
              </div>
            </div>
            <p>
              We need one shared definition first, otherwise every decision
              will be interpreted differently.
            </p>
            <span className="response-tag">Shared understanding</span>
          </article>

          <div className="comparison-divider" aria-hidden="true">
            <span>vs</span>
          </div>

          <article className="response-card">
            <div className="response-card-heading">
              <ParticipantAvatar name="Maya" />
              <div>
                <strong>Maya</strong>
                <span>Source of truth</span>
              </div>
            </div>
            <p>
              Let&apos;s agree on the outcome we want people to leave with, then
              choose the simplest path to get there.
            </p>
            <span className="response-tag">Clear outcome</span>
          </article>
        </div>

        <div className="compare-reflection">
          <MessageCircleIcon aria-hidden="true" />
          <span>Notice a connection? Keep it in mind for the next question.</span>
        </div>

        <FlowActions
          className="compare-actions"
          primaryHref="/meme"
          primaryLabel="Continue"
        />
      </section>
    </RoomFlowShell>
  );
}
