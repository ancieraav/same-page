'use client';

interface ShareInviteModalProps {
  roomCode: string;
  onClose: () => void;
  onCopy: (value: string, label: string) => void;
}

// PAIR_MODE: single invite code/link (no per-group/role codes).
// REVIVE: see ShareRolesModal.tsx for per-group role codes & SOT cards.
export function ShareInviteModal({ roomCode, onClose, onCopy }: ShareInviteModalProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const link = `${origin}/join?code=${encodeURIComponent(roomCode)}`;

  return (
    <div
      className="share-roles-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <dialog
        open
        className="share-roles-modal"
        aria-labelledby="share-modal-title"
        style={{ padding: 0, border: 'none', margin: 'auto', color: 'inherit' }}
      >
        <div className="share-roles-header">
          <div>
            <h3 className="share-modal-title" id="share-modal-title">Room invite</h3>
            <p className="share-modal-sub">Send your partner the code or link below to join this 1-on-1 room.</p>
          </div>
          <button type="button" className="btn-lightbox-close" onClick={() => { onClose(); }} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="share-roles-body">
          <div className="share-role-card">
            <div className="share-role-info">
              <div className="share-role-top">
                <span className="share-role-badge">Room code</span>
                <span className="share-code-chip">
                  Code: <strong>{roomCode}</strong>
                </span>
              </div>
              <div className="share-role-roles">
                1-on-1 link: <strong>{link}</strong>
              </div>
            </div>
            <div className="share-role-actions">
              <button type="button" className="btn-share-copy" onClick={() => { onCopy(roomCode, 'Room code'); }}>
                Copy Code
              </button>
              <button
                type="button"
                className="btn-share-copy primary"
                onClick={() => { onCopy(link, 'Invite link'); }}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
