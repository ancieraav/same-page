import Image from 'next/image';

export function MemePart2({ countdown, onNext, busy }: { countdown: number; onNext: () => void; busy: boolean }) {
  return (
    <main className={"meme-canvas-wrapper"} id={"meme-canvas-wrapper"}>
      <div className={"question-round-indicator"}>
        <span className={"round-indicator-dot"} aria-hidden={"true"}></span>
        <span>
          Intermission &bull; Room Reset
        </span>
      </div>
      <div className={"meme-header-group"}>
        <h1 className={"meme-headline"} id={"meme-headline"}>
           Sarah Jenkins be like 
        </h1>
        <p className={"meme-sub-caption"} id={"meme-sub-caption"}>
           Waiting for backend to fix the database latency before scaling marketing campaigns. 
        </p>
      </div>
      <div className={"meme-gif-display"}>
        <Image className={"meme-gif-image"} id={"meme-gif-image"} src={"https://media.giphy.com/media/bLzSbiS3Lzkrwl6ENS/giphy.gif"} alt={"Sarah Jenkins waiting meme"} width={640} height={360} priority unoptimized />
      </div>
      <div className={"meme-actions-container"}>
        <button type={"button"} className={"btn-force-next-question"} id={"btn-force-next"} onClick={onNext} disabled={busy}>
          <span className={"btn-countdown-pill"} id={"btn-countdown-timer"}>
            {countdown}s
          </span>
          <span className={"btn-text-label"}>
            Next question
          </span>
          <svg className={"btn-arrow-icon"} width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <line x1={"5"} y1={"12"} x2={"19"} y2={"12"}></line>
            <polyline points={"12 5 19 12 12 19"}></polyline>
          </svg>
        </button>
      </div>
    </main>
  );
}
