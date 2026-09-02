import type { Metadata } from "next";
import { ArrowRightIcon, HeartIcon, SparklesIcon } from "lucide-react";

import { FlowPill, RoomFlowShell } from "@/components/room-flow";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meme break — Same Page",
  description: "Take a quick meme break between Same Page questions.",
};

export default function MemePage() {
  return (
    <RoomFlowShell
      className="meme-page"
      eyebrow="Product critique · Intermission"
      title="Meme break"
      description="A small reset before the next question."
      backHref="/question-two"
      backLabel="Back to responses"
    >
      <section className="meme-stage" aria-labelledby="meme-title">
        <div className="meme-stage-heading">
          <FlowPill>
            <SparklesIcon aria-hidden="true" />
            Optional intermission
          </FlowPill>
          <h2 id="meme-title">When the brainstorm finally clicks</h2>
          <p>Take a breath. The next question is waiting when you are ready.</p>
        </div>

        <div className="meme-art" role="img" aria-label="Abstract celebratory meme placeholder">
          <div className="meme-art-sun" aria-hidden="true" />
          <div className="meme-art-cloud meme-art-cloud-one" aria-hidden="true" />
          <div className="meme-art-cloud meme-art-cloud-two" aria-hidden="true" />
          <div className="meme-art-copy">
            <span>Same page</span>
            <strong>Same energy</strong>
          </div>
          <HeartIcon className="meme-art-heart" aria-hidden="true" />
        </div>

        <div className="meme-footer">
          <span>Shared by the room</span>
          <Button className="flow-action flow-action-primary" asChild>
            <Link href="/add-question">
              Next question
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </RoomFlowShell>
  );
}
