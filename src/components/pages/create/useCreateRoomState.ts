'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGuestId } from '@/lib/guest';
import { writeStored } from '@/lib/storage';
import { PAIR_MODE, PAIR_SIZE } from '@/lib/pairMode';
import { useToast } from '@/components/ui/ToastProvider';
import { blobToDataUrl } from '@/lib/blob';
import { isHttpUrl, isSupportedAttachment, maxAttachmentBytes, remoteFileName, SUPPORTED_ATTACHMENT_LABEL } from '@/lib/attachmentRemote';
import type { Attachment } from '@/components/pages/create/CreateAttachmentsSection';
import type { Group } from '@/components/pages/create/CreateGroupsSection';

const suggestions = [
  'Q3 Strategic Priorities Sync',
  'Design System Architecture Review',
  'Core Product Roadmap Alignment',
  'Marketing Funnel Optimization',
  'Engineering Architecture Review',
];

const groupHistory = [
  'Executives', 'Product Management', 'Engineering',
  'Design & UX', 'Marketing & Growth', 'Operations & Finance',
];

function readableSize(bytes: number) {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(name: string) {
  return (name.split('.').pop() ?? 'FILE').toUpperCase();
}

async function toAttachmentMeta(file: File, index: number): Promise<Attachment> {
  const url = file.type.startsWith('image/') ? await blobToDataUrl(file) : '';
  return {
    id: `${String(Date.now())}-${String(index)}-${file.name}`,
    file,
    name: file.name,
    size: readableSize(file.size),
    ext: extension(file.name),
    isImage: file.type.startsWith('image/'),
    url,
  };
}

function appendAttachments(
  files: File[],
  currentCount: number,
  commit: (next: Attachment[]) => void,
  onToast: (message: string, kind?: 'success' | 'error') => void,
) {
  const available = 20 - currentCount;
  if (available <= 0) { onToast('Maximum 20 documents reached', 'error'); return; }
  const valid = files.slice(0, available).filter((file) => {
    if (!isSupportedAttachment(file.name, file.type)) {
      onToast(`${file.name} is not supported. Use ${SUPPORTED_ATTACHMENT_LABEL}.`, 'error');
      return false;
    }
    if (file.size > maxAttachmentBytes()) { onToast(`${file.name} is larger than 25MB`, 'error'); return false; }
    return true;
  });
  if (valid.length === 0) return;
  void Promise.all(valid.map(async (file, index) => toAttachmentMeta(file, index))).then((next) => {
    commit(next);
    onToast(`${String(next.length)} document${next.length > 1 ? 's' : ''} added`);
  });
}

export function useCreateRoomState() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('Design Alignment Sync');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [participantMode, setParticipantMode] = useState<'flexible' | 'fixed'>(PAIR_MODE ? 'fixed' : 'flexible');
  const [participantCount, setParticipantCount] = useState(PAIR_MODE ? PAIR_SIZE : 10);
  const [useMemes] = useState(false);
  // REVIVE: set back to true to restore groups & roles UI.
  const [useGroups, setUseGroups] = useState(PAIR_MODE ? false : true);
  const [viewResponses, setViewResponses] = useState(true);
  const [anonymousNames, setAnonymousNames] = useState(true);
  const [separateRoleLinks, setSeparateRoleLinks] = useState(false);
  const [newGroup, setNewGroup] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [activeRoleGroupId, setActiveRoleGroupId] = useState<number | null>(null);
  const [roleInputs, setRoleInputs] = useState<Record<number, string>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);
  const [busy, setBusy] = useState(false);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    appendAttachments(Array.from(fileList), attachments.length, (next) => {
      setAttachments((current) => [...current, ...next]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, (message, kind) => { showToast(message, kind ?? 'success'); });
  };

  /** Agent path: fetch an http(s) URL and attach it as a file. Returns a result for the tool output. */
  const addRemoteAttachment = async (
    url: string,
    suggestedName?: string,
  ): Promise<{ ok: boolean; name?: string; error?: string }> => {
    const cleanUrl = url.trim();
    if (!isHttpUrl(cleanUrl)) return { ok: false, error: 'Provide a valid http(s) URL.' };
    if (attachments.length >= 20) return { ok: false, error: 'Maximum 20 documents reached.' };
    let response: Response;
    try {
      response = await fetch(cleanUrl);
    } catch {
      return { ok: false, error: 'Could not download the URL. Check the link or CORS access.' };
    }
    if (!response.ok) return { ok: false, error: `Download failed with status ${String(response.status)}.` };
    const blob = await response.blob();
    if (blob.size > maxAttachmentBytes()) return { ok: false, error: 'The file is larger than 25MB.' };
    if (blob.size === 0) return { ok: false, error: 'The downloaded file is empty.' };
    const fileName = remoteFileName(cleanUrl, response.headers.get('content-type'), suggestedName);
    if (!isSupportedAttachment(fileName, blob.type || response.headers.get('content-type'))) {
      return { ok: false, error: `Unsupported attachment. Use ${SUPPORTED_ATTACHMENT_LABEL}.` };
    }
    const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
    const meta = await toAttachmentMeta(file, attachments.length);
    setAttachments((current) => (current.length >= 20 ? current : [...current, meta]));
    showToast(`1 document added`);
    if (fileInputRef.current) fileInputRef.current.value = '';
    return { ok: true, name: fileName };
  };

  const addGroup = (groupName?: string) => {
    const clean = (groupName ?? newGroup).trim();
    if (!clean) return;
    if (groups.some((item) => item.name.toLowerCase() === clean.toLowerCase())) {
      showToast('A group with this name already exists', 'error');
      return;
    }
    const isFirst = groups.length === 0;
    setGroups((current) => [
      ...current,
      { id: Date.now(), name: clean, isSourceOfTruth: isFirst, roles: ['Default Role', 'Contributor'] },
    ]);
    setNewGroup('');
    setShowGroupDropdown(false);
  };

  const addRole = (groupId: number, roleName: string) => {
    const clean = roleName.trim();
    if (!clean) return;
    setGroups((current) =>
      current.map((group) => {
        if (group.id !== groupId) return group;
        if (group.roles.some((role) => role.toLowerCase() === clean.toLowerCase())) {
          showToast('Role already exists in this group', 'error');
          return group;
        }
        return { ...group, roles: [...group.roles, clean] };
      })
    );
    setRoleInputs((current) => ({ ...current, [groupId]: '' }));
    setActiveRoleGroupId(null);
  };

  const removeRole = (groupId: number, roleIndex: number) => {
    setGroups((current) =>
      current.map((group) => {
        if (group.id !== groupId) return group;
        if (group.roles.length <= 2) {
          showToast('Each group must have at least 2 roles', 'error');
          return group;
        }
        return { ...group, roles: group.roles.filter((_, idx) => idx !== roleIndex) };
      })
    );
  };

  const deleteGroup = (groupId: number) => {
    setGroups((current) => {
      const target = current.find((g) => g.id === groupId);
      const remaining = current.filter((g) => g.id !== groupId);
      if (target?.isSourceOfTruth && remaining.length > 0 && remaining[0]) {
        return remaining.map((g, idx) => (idx === 0 ? { ...g, isSourceOfTruth: true } : g));
      }
      return remaining;
    });
  };

  const setSourceOfTruth = (groupId: number) => {
    setGroups((current) =>
      current.map((group) => ({ ...group, isSourceOfTruth: group.id === groupId }))
    );
  };

  const suggestName = () => {
    const picked = suggestions[Math.floor(Math.random() * suggestions.length)];
    if (picked) {
      setName(picked);
      showToast('Room name suggested');
      return picked;
    }
    return null;
  };

  const launchRoom = () => {
    if (!name.trim()) {
      showToast('Please provide a room name.', 'error');
      return;
    }
    // REVIVE: group/role/SOT validation (hidden in PAIR_MODE).
    if (useGroups && !PAIR_MODE) {
      if (groups.length === 0) {
        showToast('Please add at least one group or turn groups off.', 'error');
        return;
      }
      const invalid = groups.find((group) => group.roles.length < 2);
      if (invalid) {
        showToast(`Group "${invalid.name}" must have at least 2 roles.`, 'error');
        return;
      }
      if (!groups.some((group) => group.isSourceOfTruth)) {
        showToast('Please mark one group as Source of Truth.', 'error');
        return;
      }
    }

    setBusy(true);
    const guestId = getGuestId();
    const roomName = name.trim();
    const roomTopic = topic.trim() || 'No explicit topic set';
    const effectiveCount = PAIR_MODE ? PAIR_SIZE : participantCount;
    const effectiveMode = PAIR_MODE ? 'fixed' as const : participantMode;
    const attachmentsMeta = attachments.map((item) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      ext: item.ext,
      isImage: item.isImage,
    }));

    // PAIR_MODE: single-code room (no per-group/role codes).
    // REVIVE: remove this block when groups & roles return.
    const create = async () => {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, topic: roomTopic, notes, guest_id: guestId, attachments: attachmentsMeta }),
      });
      const payload = (await response.json().catch(() => null)) as { code?: unknown; error?: unknown } | null;
      if (!response.ok || typeof payload?.code !== 'string') {
        showToast(typeof payload?.error === 'string' ? payload.error : 'Could not create the room. Please retry.', 'error');
        setBusy(false);
        return;
      }
      const code = payload.code;
      let persistedAttachments = attachmentsMeta;
      if (attachments.length > 0) {
        const uploadForm = new FormData();
        uploadForm.set('guest_id', guestId);
        uploadForm.set('metadata', JSON.stringify(attachmentsMeta));
        attachments.forEach((attachment) => { uploadForm.append('files', attachment.file, attachment.name); });
        const uploadResponse = await fetch(`/api/rooms/${encodeURIComponent(code)}/attachments`, {
          method: 'POST',
          body: uploadForm,
        });
        const uploadPayload = (await uploadResponse.json().catch(() => null)) as {
          attachments?: unknown;
          error?: unknown;
        } | null;
        if (!uploadResponse.ok || !Array.isArray(uploadPayload?.attachments)) {
          showToast(typeof uploadPayload?.error === 'string' ? uploadPayload.error : 'Could not upload room attachments.', 'error');
          setBusy(false);
          return;
        }
        persistedAttachments = uploadPayload.attachments as typeof attachmentsMeta;
      }
      writeStored('roomCode', code);
      writeStored('roomName', roomName);
      writeStored('roomTopic', roomTopic);
      writeStored('roomUseMemes', useMemes ? 'true' : 'false');
      writeStored('roomSeparateRoles', separateRoleLinks ? 'true' : 'false');
      writeStored('roomNotes', notes);
      writeStored('roomParticipantCount', effectiveCount);
      writeStored('roomParticipantMode', effectiveMode);
      writeStored('roomAttachments', JSON.stringify(persistedAttachments));
      if (useGroups && !PAIR_MODE) {
        writeStored('roomGroups', JSON.stringify(groups));
        const roleCodes: Record<string, string> = {};
        groups.forEach((group, index) => {
          roleCodes[group.name] = `${code}-${String(index + 1)}`;
        });
        writeStored('roomRoleCodes', JSON.stringify(roleCodes));
      } else {
        writeStored('roomGroups', '[]');
        writeStored('roomRoleCodes', '{}');
      }
      writeStored('samepage_active_room', {
        code,
        name: roomName,
        topic: roomTopic,
        notes,
        participantMode: effectiveMode,
        participantCount: effectiveCount,
        groups: [],
        attachments: persistedAttachments,
      });

      showToast('Room created! Set up your host profile.');
      // Host sets name + photo next (same identity form as joiners, different wording).
      router.push(`/join?code=${encodeURIComponent(code)}&as=host`);
    };
    void create().catch(() => {
      showToast('Could not create the room. Please retry.', 'error');
      setBusy(false);
    });
  };

  const currentGroupQuery = newGroup.trim().toLowerCase();
  const existingGroupNames = new Set(groups.map((g) => g.name.toLowerCase()));
  const suggestedGroups = groupHistory.filter(
    (g) => (!currentGroupQuery || g.toLowerCase().includes(currentGroupQuery)) && !existingGroupNames.has(g.toLowerCase())
  ).slice(0, 6);

  return {
    name, setName, suggestName,
    topic, setTopic,
    notes, setNotes,
    participantMode, setParticipantMode,
    participantCount, setParticipantCount,
    useMemes,
    useGroups, setUseGroups,
    viewResponses, setViewResponses,
    anonymousNames, setAnonymousNames,
    separateRoleLinks, setSeparateRoleLinks,
    newGroup, setNewGroup,
    showGroupDropdown, setShowGroupDropdown,
    activeRoleGroupId, setActiveRoleGroupId,
    roleInputs, setRoleInputs,
    groups, setGroups,
    attachments, setAttachments,
    activeAttachment, setActiveAttachment,
    busy,
    fileInputRef,
    suggestedGroups,
    addFiles,
    addRemoteAttachment,
    addGroup,
    addRole,
    removeRole,
    deleteGroup,
    setSourceOfTruth,
    launchRoom,
  };
}
