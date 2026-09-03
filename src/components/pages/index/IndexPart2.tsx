import { AvatarMenu } from '@/components/layout/AvatarMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';
import Link from 'next/link';
type IndexPart2Props = {
  code: string[];
  busy: boolean;
  inputRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  onCodeChange: (index: number, value: string) => void;
  onCodeKeyDown: (index: number, event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onPasteButton: () => void;
  onJoin: () => void;
};

export function IndexPart2({ code, busy, inputRefs, onCodeChange, onCodeKeyDown, onPaste, onPasteButton, onJoin }: IndexPart2Props) {
  return (
    <div className={"viewport-shell"}>
      <header className={"minimal-header"}>
        <Link href={"/"} className={"brand-group"} id={"brand-logo-link"}>
          <span className={"brand-logo-frame"}>
            <BrandLogo />
          </span>
          <span className={"brand-name"}>
            Same Page
          </span>
        </Link>
        <div className={"header-nav"}>
          <div className={"live-activity-badge"} title={"142 private rooms active right now"}>
            <div className={"activity-signal"} aria-hidden={"true"}>
              <span className={"signal-bar bar-1"}></span>
              <span className={"signal-bar bar-2"}></span>
              <span className={"signal-bar bar-3"}></span>
            </div>
            <div className={"activity-text"}>
              <span className={"activity-number"}>
                142
              </span>
              <span className={"activity-label"}>
                rooms active
              </span>
            </div>
          </div>
          <Link href={"/create"} className={"nav-link-btn"} id={"nav-create-link"}>
            <svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}>
              <line x1={"12"} y1={"5"} x2={"12"} y2={"19"}></line>
              <line x1={"5"} y1={"12"} x2={"19"} y2={"12"}></line>
            </svg>
            <span>
              Create Room
            </span>
          </Link>
          <AvatarMenu />
        </div>
      </header>
      <main className={"center-eye-stage"}>
        <div className={"eye-level-card"}>
          <div className={"hero-heading-group"}>
            <h1 className={"hero-title"}>
              Join or create room
            </h1>
            <p className={"hero-subtitle"}>
              Enter your 7-character room code to jump straight into the session.
            </p>
          </div>
          <div className={"code-entry-section"}>
            <div className={"code-inputs-row"} role={"group"} aria-label={"Enter 7 character room code"}>
              {code.map((character, index) => (
                <input
                  key={`code-${index + 1}`}
                  ref={(element) => { inputRefs.current[index] = element; }}
                  type={"text"}
                  id={`code-box-${index + 1}`}
                  className={`code-box${character ? ' filled' : ''}`}
                  maxLength={1}
                  autoComplete={"off"}
                  inputMode={"text"}
                  autoFocus={index === 0}
                  aria-label={`Character ${index + 1}`}
                  value={character}
                  onChange={(event) => onCodeChange(index, event.target.value)}
                  onKeyDown={(event) => onCodeKeyDown(index, event)}
                  onPaste={onPaste}
                />
              ))}
            </div>
            <div className={"code-utilities-row"}>
              <button type={"button"} className={"util-action-btn"} id={"btn-paste-code"} title={"Paste from clipboard"} onClick={onPasteButton}>
                <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"}>
                  <rect x={"8"} y={"2"} width={"8"} height={"4"} rx={"1"} ry={"1"}></rect>
                  <path d={"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2h2"}></path>
                </svg>
                <span>
                  Paste from clipboard
                </span>
              </button>
            </div>
          </div>
          <div className={"primary-actions-row"}>
            <Link href={"/create"} className={"btn-action-create"} id={"btn-create-link"}>
              <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"}>
                <line x1={"12"} y1={"5"} x2={"12"} y2={"19"}></line>
                <line x1={"5"} y1={"12"} x2={"19"} y2={"12"}></line>
              </svg>
              <span>
                Create
              </span>
            </Link>
            <button type={"button"} className={"btn-action-join"} id={"btn-join-room"} onClick={onJoin} disabled={busy} aria-busy={busy}>
              <span>
                {busy ? 'Connecting…' : 'Join Room'}
              </span>
              <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"}>
                <line x1={"5"} y1={"12"} x2={"19"} y2={"12"}></line>
                <polyline points={"12 5 19 12 12 19"}></polyline>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
