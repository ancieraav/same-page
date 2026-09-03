'use client';

interface Group {
  id: number;
  name: string;
  isSourceOfTruth: boolean;
  roles: string[];
}

interface ShareRolesModalProps {
  roomCode: string;
  groups?: Group[];
  onClose: () => void;
  onCopyRole: (value: string, label: string) => void;
}

export function ShareRolesModal({ roomCode, groups, onClose, onCopyRole }: ShareRolesModalProps) {
  const activeGroups = groups?.length
    ? groups
    : [{ id: 1, name: 'General', isSourceOfTruth: true, roles: ['Participant'] }];

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
            <h3 className="share-modal-title" id="share-modal-title">Role Access Codes &amp; Dedicated Links</h3>
            <p className="share-modal-sub">Send each team or participant their dedicated code below.</p>
          </div>
          <button type="button" className="btn-lightbox-close" onClick={() => { onClose(); }} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="share-roles-body">
          {activeGroups.map((group) => {
            const suffix = group.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'GP';
            const code = `${roomCode}-${suffix}`;
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const link = `${origin}/join?code=${encodeURIComponent(roomCode)}&role=${encodeURIComponent(group.roles[0] ?? group.name)}`;

            return (
              <div className={`share-role-card${group.isSourceOfTruth ? ' sot-card' : ''}`} key={group.id}>
                <div className="share-role-info">
                  <div className="share-role-top">
                    <span className="share-role-badge">
                      {group.isSourceOfTruth ? '★ ' : ''}
                      {group.name}
                    </span>
                    <span className="share-code-chip">
                      Role Code: <strong>{code}</strong>
                    </span>
                  </div>
                  <div className="share-role-roles">
                    Auto-assigned: <strong>{group.roles.join(', ') || 'Member'}</strong>
                  </div>
                </div>
                <div className="share-role-actions">
                  <button type="button" className="btn-share-copy" onClick={() => { onCopyRole(code, `${group.name} code`); }}>
                    Copy Code
                  </button>
                  <button
                    type="button"
                    className="btn-share-copy primary"
                    onClick={() => { onCopyRole(link, `${group.name} link`); }}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </dialog>
    </div>
  );
}
