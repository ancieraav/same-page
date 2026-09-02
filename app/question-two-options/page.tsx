import type { Metadata } from "next";

import { FlowActions, RoomFlowShell } from "@/components/room-flow";

export const metadata: Metadata = {
  title: "Choose an answer — Same Page",
  description: "Choose the answer that best represents your perspective.",
};

const options = [
  "Make the outcome visible",
  "Start with the decision",
  "Create a shared definition",
  "Agree on the next step",
];

export default function QuestionTwoOptionsPage() {
  return (
    <RoomFlowShell
      className="question-two-options-page"
      eyebrow="Product critique · Question 2 of 6"
      title="Choose an answer"
      description="Pick the direction that feels closest to your perspective."
      backHref="/question-two"
      backLabel="Back to comparison"
    >
      <section className="options-stage" aria-labelledby="options-prompt">
        <div className="options-stage-heading">
          <span className="question-counter">Question 2 of 6</span>
          <h2 id="options-prompt">Which direction feels most useful for the team?</h2>
          <p>Choose one. You can explain your reasoning in the next step.</p>
        </div>

        <fieldset className="question-options">
          <legend className="sr-only">Choose one direction</legend>
          {options.map((option, index) => (
            <label className="question-option" key={option}>
              <input
                type="radio"
                name="direction"
                value={option}
                defaultChecked={index === 0}
              />
              <span className="question-option-marker" aria-hidden="true" />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>

        <FlowActions
          className="options-actions"
          primaryHref="/meme"
          primaryLabel="Continue"
        />
      </section>
    </RoomFlowShell>
  );
}
