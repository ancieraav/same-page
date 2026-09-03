import Image from 'next/image';

interface ProfileFormProps {
  name: string;
  age: number;
  avatarSrc: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarTrigger: () => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNameChange: (value: string) => void;
  onAgeChange: (value: number) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function ProfileForm({
  name,
  age,
  avatarSrc,
  fileInputRef,
  onAvatarTrigger,
  onAvatarChange,
  onNameChange,
  onAgeChange,
  onSave,
  onDelete,
}: ProfileFormProps) {
  return (
    <main className="profile-canvas-wrapper">
      <section className="profile-page-header">
        <h1 className="profile-main-title">User Profile</h1>
        <p className="profile-subtitle">
          Manage your identity, profile photo, and personal account details on Same Page.
        </p>
      </section>
      <section className="profile-form-section">
        <div className="profile-side-row">
          <div className="profile-avatar-col">
            <input
              ref={fileInputRef}
              type="file"
              id="profile-photo-file-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onAvatarChange}
            />
            <button
              type="button"
              className="profile-avatar-circle-btn"
              id="btn-avatar-circle-trigger"
              title="Click to change profile photo"
              onClick={onAvatarTrigger}
            >
              {avatarSrc ? (
                <Image
                  className="profile-avatar-img"
                  id="profile-avatar-giant-img"
                  src={avatarSrc}
                  alt={name}
                  width={100}
                  height={100}
                  unoptimized
                />
              ) : (
                <span className="profile-avatar-giant-text" id="profile-avatar-giant-text">
                  {name.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
              <div className="avatar-camera-hover-badge" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>
            <span className="profile-avatar-hint">Click to change</span>
          </div>
          <div className="profile-form-grid">
            <div className="profile-field-group">
              <label htmlFor="profile-input-name" className="profile-field-label">
                Full Name
              </label>
              <input
                type="text"
                id="profile-input-name"
                className="profile-field-input"
                placeholder="Enter your full name"
                value={name}
                autoComplete="name"
                onChange={(event) => { onNameChange(event.target.value); }}
              />
              <p className="profile-field-hint">
                This name will be displayed to other participants in active sessions.
              </p>
            </div>
            <div className="profile-field-group">
              <label htmlFor="profile-input-age" className="profile-field-label">
                Age (Years)
              </label>
              <input
                type="number"
                id="profile-input-age"
                className="profile-field-input"
                placeholder="e.g. 28"
                value={age}
                min="10"
                max="120"
                onChange={(event) => { onAgeChange(Number(event.target.value) || 10); }}
              />
              <p className="profile-field-hint">
                Used anonymously for group perspective and demographic insights.
              </p>
            </div>
          </div>
        </div>
        <div className="profile-action-row">
          <button type="button" className="btn-save-profile" id="btn-save-profile" onClick={onSave}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Save Changes</span>
          </button>
        </div>
      </section>
      <div className="profile-section-divider" />
      <section className="profile-danger-section">
        <div className="danger-header-row">
          <h2 className="danger-title">Delete Account</h2>
        </div>
        <p className="danger-description">
          Deleting your account will permanently remove all profile data, photos, preferences, and session history from this device. This action cannot be undone.
        </p>
        <div className="danger-action-row">
          <button
            type="button"
            className="btn-delete-account-trigger"
            id="btn-delete-account-trigger"
            onClick={onDelete}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete My Account</span>
          </button>
        </div>
      </section>
    </main>
  );
}
