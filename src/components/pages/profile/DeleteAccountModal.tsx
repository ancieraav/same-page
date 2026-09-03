type DeleteAccountModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteAccountModal({ open, onClose, onConfirm }: DeleteAccountModalProps) {
  return (
    <div
      className={`delete-modal-overlay${open ? ' is-active' : ''}`}
      id="delete-modal-overlay"
      role="presentation"
      aria-hidden={!open}
      onMouseDown={(event) => event.currentTarget === event.target && onClose()}
    >
      <div className="delete-modal-card">
        <div className="modal-icon-badge">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
        <h3 className="modal-title" id="delete-modal-title">
          Delete Account Permanently?
        </h3>
        <p className="modal-body-text">
          Are you sure you want to delete this account? All your preferences and session history will be permanently wiped from this browser.
        </p>
        <div className="modal-buttons-row">
          <button type="button" className="btn-modal-cancel" id="btn-cancel-delete" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-modal-confirm-delete" id="btn-confirm-delete" onClick={onConfirm}>
            Yes, Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
