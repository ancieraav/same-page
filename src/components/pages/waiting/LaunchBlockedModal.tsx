'use client';

import { AccessibleModal } from '@/components/ui/AccessibleModal';

interface LaunchBlockedModalProps {
  roomCode: string;
  onClose: () => void;
}

/** Manual launch is disabled — only the AI agent may start via WebMCP. */
export function LaunchBlockedModal({ roomCode, onClose }: LaunchBlockedModalProps) {
  return (
    <AccessibleModal open labelledBy="launch-blocked-title" className="delete-modal-overlay is-active" onClose={onClose}>
      <div className="delete-modal-card" role="document">
        <div className="modal-icon-badge info" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
        </div>
        <h3 className="modal-title" id="launch-blocked-title">AI start required</h3>
        <p className="modal-body-text">
          Manual launch is disabled. Please ask your AI agent to start this session through WebMCP —
          this app cannot run without AI.
        </p>
        <div className="modal-tool-box">
          <span className="modal-tool-label">WebMCP tool</span>
          <code className="modal-tool-name">start_session</code>
          <p>
            Tell your agent to call <strong>start_session</strong> for room <strong>{roomCode}</strong> once
            both players have marked themselves ready.
          </p>
        </div>
        <div className="modal-buttons-row">
          <button type="button" className="btn-modal-cancel" onClick={() => { onClose(); }}>
            Close
          </button>
          <button type="button" className="btn-modal-primary" id="btn-launch-blocked-ok" onClick={() => { onClose(); }}>
            Got it
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
}
