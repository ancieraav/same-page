'use client';

import Link from 'next/link';
import { CreateAttachmentsSection } from '@/components/pages/create/CreateAttachmentsSection';
import { CreateGroupsSection } from '@/components/pages/create/CreateGroupsSection';
import { CreateRoomSettingsSection } from '@/components/pages/create/CreateRoomSettingsSection';
import { useCreateRoomState } from '@/components/pages/create/useCreateRoomState';
import { PAIR_MODE } from '@/lib/pairMode';

export function CreateRoomForm() {
  const formState = useCreateRoomState();

  return (
    <main className="create-clean-canvas" id="main-content">
      <div className="create-clean-wrapper">
        <div className="create-heading-block">
          <h1 className="create-headline">Create room</h1>
          <p className="create-subheadline">Set up your private 1-on-1 session details and rules.</p>
        </div>
        <form
          id="create-room-form"
          onSubmit={(event) => {
            event.preventDefault();
            formState.launchRoom();
          }}
        >
          <div className="clean-form-row">
            <div className="clean-label-row">
              <label htmlFor="room-name" className="clean-label">
                Room name <span className="clean-mandatory">*</span>
              </label>
              <button
                type="button"
                className="btn-text-action"
                onClick={formState.suggestName}
              >
                Suggest name
              </button>
            </div>
            <input
              id="room-name"
              className="clean-input"
              placeholder="Give your room a name."
              aria-label="Room name"
              value={formState.name}
              onChange={(event) => { formState.setName(event.target.value); }}
              required
            />
          </div>

          <div className="clean-form-row">
            <div className="clean-label-row">
              <label htmlFor="room-topic" className="clean-label">
                Topic <span className="clean-optional">(optional)</span>
              </label>
            </div>
            <input
              id="room-topic"
              className="clean-input"
              placeholder="What is this room about?"
              aria-label="Room topic"
              value={formState.topic}
              onChange={(event) => { formState.setTopic(event.target.value); }}
            />
          </div>

          <CreateAttachmentsSection
            attachments={formState.attachments}
            fileInputRef={formState.fileInputRef}
            activeAttachment={formState.activeAttachment}
            onAddFiles={formState.addFiles}
            onRemove={(id) => {
              formState.setAttachments((current) => current.filter((file) => file.id !== id));
            }}
            onSelect={formState.setActiveAttachment}
          />

          <div className="clean-form-row">
            <label htmlFor="room-notes" className="clean-label">
              Any other information? <span className="clean-optional">(optional)</span>
            </label>
            <p className="clean-hint">Add context, instructions, or anything participants should know.</p>
            <textarea
              id="room-notes"
              className="clean-textarea"
              placeholder="Add ground rules, instructions, or agenda notes..."
              aria-label="Additional notes"
              value={formState.notes}
              onChange={(event) => { formState.setNotes(event.target.value); }}
            />
          </div>

          <CreateRoomSettingsSection
            participantMode={formState.participantMode}
            participantCount={formState.participantCount}
            useMemes={formState.useMemes}
            viewResponses={formState.viewResponses}
            anonymousNames={formState.anonymousNames}
            onParticipantModeChange={formState.setParticipantMode}
            onParticipantCountChange={formState.setParticipantCount}
            onUseMemesChange={formState.setUseMemes}
            onViewResponsesChange={formState.setViewResponses}
            onAnonymousNamesChange={formState.setAnonymousNames}
          />

          {/* REVIVE: groups & roles + SOT + separate links (hidden in PAIR_MODE) */}
          {!PAIR_MODE && (
          <CreateGroupsSection
            useGroups={formState.useGroups}
            groups={formState.groups}
            roleInputs={formState.roleInputs}
            activeRoleGroupId={formState.activeRoleGroupId}
            newGroup={formState.newGroup}
            showGroupDropdown={formState.showGroupDropdown}
            suggestedGroups={formState.suggestedGroups}
            separateRoleLinks={formState.separateRoleLinks}
            onToggleUseGroups={formState.setUseGroups}
            onSetSourceOfTruth={formState.setSourceOfTruth}
            onDeleteGroup={formState.deleteGroup}
            onRemoveRole={formState.removeRole}
            onAddRole={formState.addRole}
            onRoleInputChange={(id, val) => {
              formState.setRoleInputs((current) => ({ ...current, [id]: val }));
            }}
            onActiveRoleGroupChange={formState.setActiveRoleGroupId}
            onNewGroupChange={formState.setNewGroup}
            onShowGroupDropdown={formState.setShowGroupDropdown}
            onAddGroup={formState.addGroup}
            onToggleSeparateRoleLinks={formState.setSeparateRoleLinks}
          />
          )}

          <div className="clean-actions-footer">
            <Link href="/" className="btn-clean-cancel" id="btn-cancel">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-clean-submit"
              id="btn-create-submit"
              disabled={formState.busy}
            >
              {formState.busy ? 'Launching...' : 'Create & Launch Room'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
