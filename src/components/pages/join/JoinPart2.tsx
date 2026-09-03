import Link from 'next/link';
/* eslint-disable @next/next/no-img-element -- browser object URLs are created for local uploads. */

type JoinPart2Props = {
  name: string;
  avatarSrc: string;
  busy: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarTrigger: () => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNameChange: (value: string) => void;
  onEnter: () => void;
};

export function JoinPart2({ name, avatarSrc, busy, fileInputRef, onAvatarTrigger, onAvatarChange, onNameChange, onEnter }: JoinPart2Props) {
  return (
    <main className={"join-identity-stage"}>
      <div className={"join-identity-card"}>
        <div className={"join-hero-header"}>
          <h1 className={"join-main-title"}>
            Set Your Room Identity
          </h1>
          <p className={"join-subtitle"}>
             Customize your display name and photo specifically for this session. 
          </p>
        </div>
        <div className={"join-profile-side-row"}>
          <div className={"join-avatar-col"}>
            <input ref={fileInputRef} type={"file"} id={"join-avatar-file-input"} accept={"image/*"} style={{ display: "none" }} onChange={onAvatarChange} />
            <button type={"button"} className={"join-avatar-btn"} id={"btn-join-avatar-trigger"} title={"Click to choose profile photo"} onClick={onAvatarTrigger}>
              <span className={"profile-avatar-giant-text"} id={"join-avatar-giant-text"} style={{ display: avatarSrc ? "none" : "block" }}>
                {name.charAt(0).toUpperCase() || 'A'}
              </span>
              {avatarSrc ? <img className={"profile-avatar-img"} id={"join-avatar-giant-img"} src={avatarSrc} alt={"Room Avatar Photo"} /> : null}
              <div className={"avatar-camera-hover-badge"} aria-hidden={"true"}>
                <svg width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <path d={"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"}></path>
                  <circle cx={"12"} cy={"13"} r={"4"}></circle>
                </svg>
              </div>
            </button>
            <span className={"join-avatar-hint"}>
              Click to change
            </span>
          </div>
          <div className={"join-name-col"}>
            <label htmlFor={"join-input-name"} className={"profile-field-label"}>
              Display Name in Room
            </label>
            <input type={"text"} id={"join-input-name"} className={"profile-field-input"} placeholder={"e.g. Alex Morgan"} value={name} autoComplete={"name"} onChange={(event) => onNameChange(event.target.value)} />
            <p className={"profile-field-hint"}>
              This name will appear on your opinion bubble and comparison cards.
            </p>
          </div>
        </div>
        <div className={"join-form-stack"}>
          <button type={"button"} className={"btn-continue-join"} id={"btn-enter-room"} onClick={onEnter} disabled={busy} aria-busy={busy}>
            <span>
              {busy ? 'Entering Room…' : 'Enter Waiting Room'}
            </span>
            <svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <line x1={"5"} y1={"12"} x2={"19"} y2={"12"}></line>
              <polyline points={"12 5 19 12 12 19"}></polyline>
            </svg>
          </button>
          <Link href={"/"} className={"btn-back-code-link"} id={"btn-back-code-link"}>
            <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <polyline points={"15 18 9 12 15 6"}></polyline>
            </svg>
            <span>
              Enter a different code
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
