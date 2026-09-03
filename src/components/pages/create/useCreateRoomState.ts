'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { writeStored } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { blobToDataUrl } from '@/lib/blob';
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

export function useCreateRoomState() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('Design Alignment Sync');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [participantMode, setParticipantMode] = useState<'flexible' | 'fixed'>('flexible');
  const [participantCount, setParticipantCount] = useState(10);
  const [useMemes, setUseMemes] = useState(true);
  const [useGroups, setUseGroups] = useState(true);
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
    const available = 20 - attachments.length;
    if (available <= 0) { showToast('Maximum 20 documents reached', 'error'); return; }
    const selected = Array.from(fileList).slice(0, available);
    const valid = selected.filter((file) => {
      if (file.size > 25 * 1024 * 1024) { showToast(`${file.name} is larger than 25MB`, 'error'); return false; }
      return true;
    });
    void Promise.all(
      valid.map(async (file, index) => {
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
      })
    ).then((next) => {
      setAttachments((current) => [...current, ...next]);
      if (next.length) showToast(`${String(next.length)} document${next.length > 1 ? 's' : ''} added`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
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
    }
  };

  const launchRoom = () => {
    if (!name.trim()) {
      showToast('Please provide a room name.', 'error');
      return;
    }
    if (useGroups) {
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
    const code = String(Math.floor(100000 + Math.random() * 900000));
    writeStored('roomCode', code);
    writeStored('roomName', name.trim());
    writeStored('roomTopic', topic.trim() || 'No explicit topic set');
    writeStored('roomUseMemes', useMemes ? 'true' : 'false');
    writeStored('roomSeparateRoles', separateRoleLinks ? 'true' : 'false');
    writeStored('roomNotes', notes);

    const attachmentsMeta = attachments.map((item) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      ext: item.ext,
      isImage: item.isImage,
      url: item.url,
    }));
    writeStored('roomAttachments', JSON.stringify(attachmentsMeta));

    if (useGroups) {
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

    showToast('Room initialized successfully!');
    router.push('/waiting');
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
    useMemes, setUseMemes,
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
    addGroup,
    addRole,
    removeRole,
    deleteGroup,
    setSourceOfTruth,
    launchRoom,
  };
}
