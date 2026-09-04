'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateAttachmentsSection } from '@/components/pages/create/CreateAttachmentsSection';
import { CreateGroupsSection } from '@/components/pages/create/CreateGroupsSection';
import { CreateRoomSettingsSection } from '@/components/pages/create/CreateRoomSettingsSection';
import { useCreateRoomState } from '@/components/pages/create/useCreateRoomState';
import { useCreateWebMCP } from '@/components/pages/create/useCreateWebMCP';
import { PAIR_MODE, PAIR_SIZE } from '@/lib/pairMode';

export function CreateRoomForm() {
  const formState = useCreateRoomState();
  const router = useRouter();

  const clearText = (get: () => string, set: (value: string) => void) => () => {
    const had = get().length > 0;
    if (had) set('');
    return had;
  };

  useCreateWebMCP({
    getRoomName: () => formState.name,
    setRoomName: formState.setName,
    clearRoomName: clearText(() => formState.name, formState.setName),
    getTopic: () => formState.topic,
    setTopic: formState.setTopic,
    clearTopic: clearText(() => formState.topic, formState.setTopic),
    getNotes: () => formState.notes,
    setNotes: formState.setNotes,
    clearNotes: clearText(() => formState.notes, formState.setNotes),
    getMaxParticipants: () => ({
      value: PAIR_MODE ? PAIR_SIZE : formState.participantCount,
      fixed: PAIR_MODE,
    }),
    getAttachments: () => formState.attachments.map((item) => ({ id: item.id, name: item.name, size: item.size, ext: item.ext })),
    addAttachmentFromUrl: (url, filename) => formState.addRemoteAttachment(url, filename),
    removeAttachments: (targets) => {
      const removed: string[] = [];
      const notFound: string[] = [];
      const idsToRemove = new Set<string>();
      const byId = new Map(formState.attachments.map((item) => [item.id, item]));
      const byName = new Map(formState.attachments.map((item) => [item.name, item]));
      for (const key of targets) {
        const target = byId.get(key) ?? byName.get(key);
        if (!target) {
          notFound.push(key);
          continue;
        }
        if (idsToRemove.has(target.id)) continue;
        idsToRemove.add(target.id);
        removed.push(target.name);
      }
      if (idsToRemove.size > 0) {
        formState.setAttachments((current) => current.filter((file) => !idsToRemove.has(file.id)));
      }
      return { removed, notFound };
    },
    openAttachmentPicker: () => {
      formState.fileInputRef.current?.click();
      return formState.fileInputRef.current !== null;
    },
    submitCreateForm: () => {
      if (!formState.name.trim()) return { ok: false, error: 'Please provide a room name.' };
      if (formState.busy) return { ok: false, error: 'Room creation is already in progress.' };
      formState.launchRoom();
      return { ok: true };
    },
    cancelCreateForm: () => {
      router.push('/');
    },
  });

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
                id="btn-suggest-name"
                onClick={() => { formState.suggestName(); }}
              >
                Suggest name
              </button>
            </div>
            <input
              id="room-name"
              name="roomName"
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
              name="topic"
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
              name="notes"
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
            viewResponses={formState.viewResponses}
            anonymousNames={formState.anonymousNames}
            onParticipantModeChange={formState.setParticipantMode}
            onParticipantCountChange={formState.setParticipantCount}
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
