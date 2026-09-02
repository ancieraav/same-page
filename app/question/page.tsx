import type { Metadata } from "next";
import { Clock3Icon, LockKeyholeIcon } from "lucide-react";

import { FlowActions, FlowPill, RoomFlowShell } from "@/components/room-flow";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Question — Same Page",
  description: "Answer a question together in Same Page.",
};

export default function QuestionPage() {
  return (
    <RoomFlowShell
      className="question-page"
      eyebrow="Product critique · Question 1 of 6"
      title="Answer the question"
      description="Write your answer independently, then compare perspectives with the room."
      backHref="/waiting-room"
      backLabel="Back to waiting room"
    >
      <section className="question-stage" aria-labelledby="question-prompt">
        <div className="question-stage-meta">
          <FlowPill>Everyone answers</FlowPill>
          <span>
            <Clock3Icon aria-hidden="true" />
            About 2 minutes
          </span>
        </div>
        <h2 id="question-prompt">
          What should everyone understand the same way before we move forward?
        </h2>
        <p className="question-stage-description">
          Be specific enough that another person can see the idea from your
          point of view.
        </p>
        <Textarea
          className="participant-answer"
          placeholder="Start writing your answer…"
          rows={8}
          aria-label="Your answer"
        />
        <div className="answer-footer">
          <span className="answer-privacy">
            <LockKeyholeIcon aria-hidden="true" />
            Your answer is private until everyone submits.
          </span>
          <FlowActions
            primaryHref="/question-two"
            primaryLabel="Submit answer"
          />
        </div>
      </section>
    </RoomFlowShell>
  );
}
