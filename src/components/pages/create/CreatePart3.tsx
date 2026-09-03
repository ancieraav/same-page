/* eslint-disable @next/next/no-img-element -- browser object URLs are created for local uploads. */
'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { writeStored } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';

type Group = { id: number; name: string; isSourceOfTruth: boolean; roles: string[] };
type Attachment = { id: string; file: File; name: string; size: string; ext: string; isImage: boolean; url: string };

const suggestions = ['Sprint 42 Retrospective', 'Architecture Alignment Sync', 'Product Strategy Review', 'Design System Workshop', 'Quarterly Priority Decision'];
const groupHistory = ['Leadership', 'Product Management', 'Engineering', 'Design & UX', 'QA & Testing', 'Marketing', 'Operations', 'Executive Committee'];
const roleHistory = [
  'Source of Truth', 'Decision Maker', 'Facilitator', 'Lead Architect',
  'Reviewer', 'Product Owner', 'Tech Lead', 'Scrum Master', 'Design Lead',
  'Contributor', 'Observer'
];

function readableSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(name: string) {
  return (name.split('.').pop() || 'FILE').toUpperCase();
}

export function CreatePart3() {
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
    const next = valid.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file, name: file.name, size: readableSize(file.size), ext: extension(file.name),
      isImage: file.type.startsWith('image/'), url: URL.createObjectURL(file),
    }));
    setAttachments((current) => [...current, ...next]);
    if (next.length) showToast(`${next.length} document${next.length > 1 ? 's' : ''} added`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addGroup = (groupName?: string) => {
    const clean = (groupName ?? newGroup).trim();
    if (!clean) { showToast('Please type a group name', 'error'); return; }
    setGroups((current) => [
      ...current,
      {
        id: Date.now(),
        name: clean,
        isSourceOfTruth: current.length === 0,
        roles: ['Contributor', 'Reviewer'],
      },
    ]);
    setNewGroup('');
    setShowGroupDropdown(false);
    showToast(`Group "${clean}" added`);
  };

  const addRole = (groupId: number, role: string) => {
    const clean = role.trim();
    if (!clean) return;
    setGroups((current) => current.map((group) => group.id === groupId && !group.roles.includes(clean) ? { ...group, roles: [...group.roles, clean] } : group));
    setRoleInputs((prev) => ({ ...prev, [groupId]: '' }));
    setActiveRoleGroupId(null);
    showToast(`Role "${clean}" added`);
  };

  const removeRole = (groupId: number, roleIndex: number) => {
    setGroups((current) => current.map((g) => {
      if (g.id === groupId) {
        const removed = g.roles[roleIndex];
        if (removed) showToast(`Role "${removed}" removed`);
        return { ...g, roles: g.roles.filter((_, idx) => idx !== roleIndex) };
      }
      return g;
    }));
  };

  const deleteGroup = (groupId: number) => {
    setGroups((current) => {
      const target = current.find((item) => item.id === groupId);
      const next = current.filter((item) => item.id !== groupId);
      if (target?.isSourceOfTruth && next.length > 0) {
        next[0].isSourceOfTruth = true;
      }
      return next;
    });
    showToast('Group removed');
  };

  const setSourceOfTruth = (groupId: number) => {
    setGroups((current) => current.map((item) => ({ ...item, isSourceOfTruth: item.id === groupId })));
    const target = groups.find((item) => item.id === groupId);
    if (target) showToast(`"${target.name}" is now the Source of Truth`);
  };

  const launchRoom = () => {
    if (!name.trim()) { showToast('Please enter a room name', 'error'); return; }
    if (useGroups) {
      if (groups.length === 0) {
        showToast('Please add at least one group or disable groups', 'error');
        return;
      }
      const underfilledGroup = groups.find((g) => g.roles.length < 2);
      if (underfilledGroup) {
        showToast(`Group "${underfilledGroup.name}" must have at least 2 roles`, 'error');
        return;
      }
    }
    setBusy(true);
    writeStored('samepage_active_room', {
      code: 'SP-7942', name: name.trim(), topic: topic.trim() || 'General', notes,
      participantMode, participantCount, useMemes, useGroups, viewResponses, anonymousNames, separateRoleLinks,
      groups, attachments: attachments.map(({ name: fileName, size, ext, isImage }) => ({ name: fileName, size, ext, isImage })),
    });
    showToast('Room created successfully');
    window.setTimeout(() => router.push('/waiting'), 600);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); addFiles(event.dataTransfer.files); };

  const cleanGroupQuery = newGroup.trim().toLowerCase();
  const existingGroupNames = groups.map((g) => g.name.toLowerCase());
  const suggestedGroups = groupHistory.filter(
    (item) => (!cleanGroupQuery || item.toLowerCase().includes(cleanGroupQuery)) && !existingGroupNames.includes(item.toLowerCase())
  ).slice(0, 6);

  return (
    <main className="create-clean-canvas">
      <div className="create-clean-wrapper">
        <div className="create-heading-block"><h1 className="create-headline">Create room</h1><p className="create-subheadline">Set up your private session details, rules, and participant roles.</p></div>
        <form id="create-room-form" onSubmit={(event) => { event.preventDefault(); launchRoom(); }}>
          <div className="clean-form-row"><div className="clean-label-row"><label htmlFor="room-name" className="clean-label">Room name <span className="clean-mandatory">*</span></label><button type="button" className="btn-text-action" onClick={() => { const picked = suggestions[Math.floor(Math.random() * suggestions.length)]; setName(picked); showToast('Room name suggested'); }}>Suggest name</button></div><input id="room-name" className="clean-input" placeholder="Give your room a name." value={name} onChange={(event) => setName(event.target.value)} required /></div>
          <div className="clean-form-row"><div className="clean-label-row"><label htmlFor="room-topic" className="clean-label">Topic <span className="clean-optional">(optional)</span></label></div><input id="room-topic" className="clean-input" placeholder="What is this room about?" value={topic} onChange={(event) => setTopic(event.target.value)} /></div>
          <div className="clean-form-row"><div className="clean-label-row"><label className="clean-label">Attachments <span className="clean-optional">(optional)</span></label>{attachments.length > 0 && <span className="attachment-counter-pill">{attachments.length} of 20</span>}</div><p className="clean-hint">Upload up to 20 documents or images to share with the room (PDF, Word, Excel, PNG, JPG up to 25MB each). Click any document to view its content.</p><input ref={fileInputRef} type="file" id="file-input" multiple hidden accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" aria-label="Upload documents" onChange={(event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files)} /><div className="attachment-box-container">{attachments.length === 0 ? <div className="attachment-dropzone" tabIndex={0} role="button" aria-label="Upload attachments" onClick={() => fileInputRef.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click(); }} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}><div className="upload-icon-frame"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg></div><div className="upload-text-main"><span className="upload-link-text">Click to choose files</span> or drag &amp; drop</div><div className="upload-text-sub">Add up to 20 files (PDF, PNG, JPG, DOCX, XLSX up to 25MB each)</div></div> : <div className="attachments-list-wrapper"><div className="attachments-items-grid">{attachments.map((item) => <div className="attachment-file-card" key={item.id}><button type="button" className="file-card-main-click" onClick={() => setActiveAttachment(item)} title={`Preview ${item.name}`}>{item.isImage ? <div className="file-card-thumb"><img src={item.url} alt={item.name} /></div> : <div className="file-card-icon-badge"><span>{item.ext}</span></div>}<div className="file-card-details"><div className="file-card-name">{item.name}</div><div className="file-card-meta"><span>{item.size}</span><span className="file-card-pill">{item.ext}</span></div></div></button><div className="file-card-actions"><button type="button" className="btn-file-pill btn-file-view" onClick={() => setActiveAttachment(item)}>View</button><button type="button" className="btn-file-pill btn-file-del" onClick={() => { URL.revokeObjectURL(item.url); setAttachments((current) => current.filter((file) => file.id !== item.id)); }}>×</button></div></div>)}</div><div className="attachment-add-more-bar"><button type="button" className="btn-add-more-files" onClick={() => fileInputRef.current?.click()}>+ Add more documents</button><span className="add-more-hint-text">or drop additional files here</span></div></div>}</div></div>
          <div className="clean-form-row"><label htmlFor="room-notes" className="clean-label">Any other information? <span className="clean-optional">(optional)</span></label><p className="clean-hint">Add context, instructions, or anything participants should know.</p><textarea id="room-notes" className="clean-textarea" placeholder="Add ground rules, instructions, or agenda notes..." value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
          <div className="clean-form-row"><label className="clean-label">Number of participants <span className="clean-mandatory">*</span></label><div className="clean-segmented-toggle"><button type="button" className={`seg-btn${participantMode === 'flexible' ? ' active' : ''}`} onClick={() => setParticipantMode('flexible')}>Flexible</button><button type="button" className={`seg-btn${participantMode === 'fixed' ? ' active' : ''}`} onClick={() => setParticipantMode('fixed')}>Fixed</button></div>{participantMode === 'fixed' && <div className="stepper-sub-group"><span className="stepper-hint-label">How many participants?</span><div className="stepper-widget"><button type="button" className="stepper-ctrl" onClick={() => setParticipantCount((value) => Math.max(2, value - 1))}>−</button><input type="number" className="stepper-value" value={participantCount} min={2} max={200} onChange={(event) => setParticipantCount(Math.min(200, Math.max(2, Number(event.target.value) || 2)))} /><button type="button" className="stepper-ctrl" onClick={() => setParticipantCount((value) => Math.min(200, value + 1))}>+</button></div></div>}</div>
          <div className="clean-form-row"><label className="clean-label">Use memes? <span className="clean-mandatory">*</span></label><p className="clean-hint">Allow participants to react with GIFs and visual stickers.</p><div className="clean-segmented-toggle"><button type="button" className={`seg-btn${!useMemes ? ' active' : ''}`} onClick={() => setUseMemes(false)}>No</button><button type="button" className={`seg-btn${useMemes ? ' active' : ''}`} onClick={() => setUseMemes(true)}>Yes</button></div></div>
          <div className="clean-form-row">
            <label className="clean-label">Use groups &amp; roles? <span className="clean-mandatory">*</span></label>
            <p className="clean-hint">Organize participants into distinct groups with multiple roles. Exactly one group acts as the Source of Truth benchmark.</p>
            <div className="clean-segmented-toggle">
              <button type="button" className={`seg-btn${!useGroups ? ' active' : ''}`} onClick={() => setUseGroups(false)}>No</button>
              <button type="button" className={`seg-btn${useGroups ? ' active' : ''}`} onClick={() => setUseGroups(true)}>Yes</button>
            </div>
            {useGroups && (
              <div className="groups-manager-drawer" id="groups-manager-drawer">
                <div className="groups-list-container" id="groups-list-container">
                  {groups.map((group) => {
                    const currentRoleQuery = (roleInputs[group.id] || '').trim().toLowerCase();
                    const existingRoles = group.roles.map((r) => r.toLowerCase());
                    const suggestedRoles = roleHistory.filter(
                      (r) => (!currentRoleQuery || r.toLowerCase().includes(currentRoleQuery)) && !existingRoles.includes(r.toLowerCase())
                    ).slice(0, 6);

                    return (
                      <div className={`group-item-block${group.isSourceOfTruth ? ' is-sot' : ''}`} key={group.id}>
                        <div className="group-header-row">
                          <div className="group-title-area">
                            <span className="group-name-text">{group.name}</span>
                            <button
                              type="button"
                              className={`sot-badge-btn${group.isSourceOfTruth ? ' active' : ''}`}
                              onClick={() => setSourceOfTruth(group.id)}
                            >
                              {group.isSourceOfTruth ? '★ Source of Truth' : '☆ Make Source of Truth'}
                            </button>
                          </div>
                          <button
                            type="button"
                            className="btn-delete-group"
                            onClick={() => deleteGroup(group.id)}
                            title="Delete group"
                          >
                            ×
                          </button>
                        </div>
                        <div className="group-roles-area">
                          <span className="roles-caption-mini">Roles:<span className="clean-mandatory">*</span></span>
                          {group.roles.length < 2 && <span className="roles-count-warning">(min. 2 required)</span>}
                          <div className="group-roles-pills">
                            {group.roles.map((role, roleIndex) => (
                              <span className="role-pill-item" key={`${group.id}-${role}`}>
                                <span>{role}</span>
                                <button
                                  type="button"
                                  className="btn-remove-role-mini"
                                  onClick={() => removeRole(group.id, roleIndex)}
                                  title="Remove role"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            <div className="mini-role-wrap">
                              <input
                                type="text"
                                className="input-add-role-mini"
                                placeholder="+ Add role"
                                autoComplete="off"
                                value={roleInputs[group.id] || ''}
                                onChange={(event) => {
                                  const val = event.target.value;
                                  setRoleInputs((prev) => ({ ...prev, [group.id]: val }));
                                  setActiveRoleGroupId(group.id);
                                }}
                                onFocus={() => setActiveRoleGroupId(group.id)}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setActiveRoleGroupId((curr) => (curr === group.id ? null : curr));
                                  }, 180);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    const val = (roleInputs[group.id] || '').trim();
                                    if (val) addRole(group.id, val);
                                  }
                                }}
                              />
                              {activeRoleGroupId === group.id && suggestedRoles.length > 0 && (
                                <div className="autocomplete-dropdown mini-role-dropdown open">
                                  <div className="dropdown-heading-tiny">Suggested Roles</div>
                                  {suggestedRoles.map((r) => (
                                    <button
                                      key={r}
                                      type="button"
                                      className="dropdown-item-btn role-suggest-item"
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        addRole(group.id, r);
                                      }}
                                    >
                                      <span>{r}</span>
                                      <span className="dropdown-item-tag">+ Add</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="add-group-input-bar">
                  <div className="group-input-field-wrap">
                    <input
                      type="text"
                      id="new-group-input"
                      className="clean-input-compact"
                      placeholder="Type new group name..."
                      autoComplete="off"
                      value={newGroup}
                      onChange={(event) => {
                        setNewGroup(event.target.value);
                        setShowGroupDropdown(true);
                      }}
                      onFocus={() => setShowGroupDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowGroupDropdown(false), 180);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addGroup();
                        }
                      }}
                    />
                    {showGroupDropdown && suggestedGroups.length > 0 && (
                      <div id="group-suggestions-dropdown" className="autocomplete-dropdown open">
                        <div className="dropdown-heading-tiny">Suggested Groups</div>
                        {suggestedGroups.map((name) => (
                          <button
                            key={name}
                            type="button"
                            className="dropdown-item-btn group-suggest-item"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              addGroup(name);
                            }}
                          >
                            <span>{name}</span>
                            <span className="dropdown-item-tag">+ Add</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" className="btn-compact-add" id="btn-add-group" onClick={() => addGroup()}>
                    + Add Group
                  </button>
                </div>
                <div className="clean-switch-row" style={{ marginTop: 20 }}>
                  <div>
                    <div className="clean-switch-label">Separate the invite link &amp; code for each group? <span className="clean-mandatory">*</span></div>
                    <div className="clean-switch-desc">Generate unique invite links tailored to each participant group.</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={separateRoleLinks} onChange={(event) => setSeparateRoleLinks(event.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="clean-form-row"><label className="clean-label">Allow all participants to view each other&apos;s responses? <span className="clean-mandatory">*</span></label><div className="clean-segmented-toggle"><button type="button" className={`seg-btn${!viewResponses ? ' active' : ''}`} onClick={() => setViewResponses(false)}>No</button><button type="button" className={`seg-btn${viewResponses ? ' active' : ''}`} onClick={() => setViewResponses(true)}>Yes</button></div>{viewResponses && <div className="anonymous-sub-drawer" style={{ marginTop: 14 }}><div className="clean-switch-row"><div><div className="clean-switch-label">Keep participant names anonymous? <span className="clean-mandatory">*</span></div><div className="clean-switch-desc">Mask participant identities during voting.</div></div><label className="toggle-switch"><input type="checkbox" checked={anonymousNames} onChange={(event) => setAnonymousNames(event.target.checked)} /><span className="toggle-slider" /></label></div></div>}</div>
          <div className="clean-actions-footer"><Link href="/" className="btn-clean-cancel">Cancel</Link><button type="submit" className="btn-clean-submit" disabled={busy} aria-busy={busy}><span>{busy ? 'Launching…' : 'Create'}</span><span aria-hidden="true">→</span></button></div>
        </form>
      </div>
      {activeAttachment && <div className="doc-lightbox-overlay" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && setActiveAttachment(null)}><div className="doc-lightbox-modal" role="dialog" aria-modal="true" aria-labelledby="attachment-preview-title"><div className="doc-lightbox-header"><div className="doc-lightbox-meta"><span className="doc-lightbox-pill">{activeAttachment.ext}</span><span className="doc-lightbox-title" id="attachment-preview-title">{activeAttachment.name}</span><span className="doc-lightbox-size">{activeAttachment.size}</span></div><button type="button" className="btn-lightbox-close" onClick={() => setActiveAttachment(null)} aria-label="Close preview">×</button></div><div className="doc-lightbox-body">{activeAttachment.isImage ? <img className="lightbox-image-preview" src={activeAttachment.url} alt={activeAttachment.name} /> : <div className="lightbox-doc-card"><div className="lightbox-doc-name">{activeAttachment.name}</div><div className="lightbox-doc-sub">{activeAttachment.ext} Document · {activeAttachment.size}</div><a className="btn-file-pill" href={activeAttachment.url} download={activeAttachment.name}>Download Original File</a></div>}</div></div></div>}
    </main>
  );
}
