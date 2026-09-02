import type { Metadata } from "next";
import { LightbulbIcon, LockKeyholeIcon } from "lucide-react";

import { FlowActions, FlowPill, RoomFlowShell } from "@/components/room-flow";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Add a question — Same Page",
  description: "Add the next question to your Same Page room.",
};

export default function AddQuestionPage() {
  return (
    <RoomFlowShell
      className="add-question-page"
      eyebrow="Product critique · Operator controls"
      title="Add a question"
      description="Shape the next prompt while the room is still together."
      backHref="/meme"
      backLabel="Back to meme break"
    >
      <section className="add-question-layout" aria-labelledby="add-question-title">
        <div className="add-question-main">
          <FlowPill>
            <LockKeyholeIcon aria-hidden="true" />
            Only visible to the operator and source of truth
          </FlowPill>
          <h2 id="add-question-title">Want to add another question?</h2>
          <p>
            Keep it focused. A good question gives everyone a clear place to
            start.
          </p>
          <Textarea
            className="new-question-input"
            placeholder="Write the next question…"
            rows={7}
            aria-label="New question"
          />
          <div className="new-question-hint">
            <LightbulbIcon aria-hidden="true" />
            <span>Try asking about the decision, the concern, or the next step.</span>
          </div>
          <FlowActions
            className="add-question-actions"
            secondaryHref="/summary"
            secondaryLabel="Skip"
            primaryHref="/summary"
            primaryLabel="Add question"
          />
        </div>

        <aside className="add-question-aside">
          <span className="flow-label">Question flow</span>
          <strong>2 questions left</strong>
          <div className="flow-progress-bar" aria-label="Question progress">
            <span />
          </div>
          <p>The room will see the new prompt after you add it.</p>
        </aside>
      </section>
    </RoomFlowShell>
  );
}
