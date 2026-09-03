'use client';

interface CreateRoomSettingsSectionProps {
  participantMode: 'flexible' | 'fixed';
  participantCount: number;
  useMemes: boolean;
  viewResponses: boolean;
  anonymousNames: boolean;
  onParticipantModeChange: (mode: 'flexible' | 'fixed') => void;
  onParticipantCountChange: (count: number) => void;
  onUseMemesChange: (val: boolean) => void;
  onViewResponsesChange: (val: boolean) => void;
  onAnonymousNamesChange: (val: boolean) => void;
}

export function CreateRoomSettingsSection({
  participantMode,
  participantCount,
  useMemes,
  viewResponses,
  anonymousNames,
  onParticipantModeChange,
  onParticipantCountChange,
  onUseMemesChange,
  onViewResponsesChange,
  onAnonymousNamesChange,
}: CreateRoomSettingsSectionProps) {
  return (
    <>
      <div className="clean-form-row">
        <div className="clean-label">
          Number of participants <span className="clean-mandatory">*</span>
        </div>
        <div className="clean-segmented-toggle">
          <button
            type="button"
            className={`seg-btn${participantMode === 'flexible' ? ' active' : ''}`}
            onClick={() => { onParticipantModeChange('flexible'); }}
          >
            Flexible
          </button>
          <button
            type="button"
            className={`seg-btn${participantMode === 'fixed' ? ' active' : ''}`}
            onClick={() => { onParticipantModeChange('fixed'); }}
          >
            Fixed
          </button>
        </div>
        {participantMode === 'fixed' && (
          <div className="stepper-sub-group">
            <span className="stepper-hint-label">How many participants?</span>
            <div className="stepper-widget">
              <button
                type="button"
                className="stepper-ctrl"
                aria-label="Decrease participants"
                onClick={() => { onParticipantCountChange(Math.max(2, participantCount - 1)); }}
              >
                −
              </button>
              <input
                type="number"
                className="stepper-value"
                aria-label="Participant count"
                value={participantCount}
                min={2}
                max={200}
                onChange={(event) => {
                  onParticipantCountChange(Math.min(200, Math.max(2, Number(event.target.value) || 2)));
                }}
              />
              <button
                type="button"
                className="stepper-ctrl"
                aria-label="Increase participants"
                onClick={() => { onParticipantCountChange(Math.min(200, participantCount + 1)); }}
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="clean-form-row">
        <div className="clean-label">
          Use memes? <span className="clean-mandatory">*</span>
        </div>
        <p className="clean-hint">Allow participants to react with GIFs and visual stickers.</p>
        <div className="clean-segmented-toggle">
          <button
            type="button"
            className={`seg-btn${!useMemes ? ' active' : ''}`}
            onClick={() => { onUseMemesChange(false); }}
          >
            No
          </button>
          <button
            type="button"
            className={`seg-btn${useMemes ? ' active' : ''}`}
            onClick={() => { onUseMemesChange(true); }}
          >
            Yes
          </button>
        </div>
      </div>

      <div className="clean-switch-row">
        <div>
          <div className="clean-switch-label">
            View each other&apos;s responses? <span className="clean-mandatory">*</span>
          </div>
          <div className="clean-switch-desc">
            Allow participants to explore aligned and divergent perspectives.
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            aria-label="View each other's responses"
            checked={viewResponses}
            onChange={(event) => { onViewResponsesChange(event.target.checked); }}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      <div className="clean-switch-row">
        <div>
          <div className="clean-switch-label">
            Anonymous names? <span className="clean-mandatory">*</span>
          </div>
          <div className="clean-switch-desc">
            Hide real participant identities with creative pseudonym avatars.
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            aria-label="Anonymous names"
            checked={anonymousNames}
            onChange={(event) => { onAnonymousNamesChange(event.target.checked); }}
          />
          <span className="toggle-slider" />
        </label>
      </div>
    </>
  );
}
