import type { Metadata } from "next";
import { FlowActions, RoomFlowShell } from "@/components/room-flow";
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
          <FlowActions
            className="add-question-actions"
            secondaryHref="/summary"
            secondaryLabel="Skip"
            primaryHref="/summary"
            primaryLabel="Add question"
          />
        </div>
      </section>
    </RoomFlowShell>
  );
}
