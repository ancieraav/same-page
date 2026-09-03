'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { copyText } from '@/lib/clipboard';
import { readStored } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { WaitingPart1 } from './WaitingPart1';
import { WaitingPart2 } from './WaitingPart2';
import { WaitingPart3 } from './WaitingPart3';

type Room = {
  code: string; name: string; topic: string; notes?: string; participantMode?: string; participantCount?: number;
  groups?: Array<{ id: number; name: string; isSourceOfTruth: boolean; roles: string[] }>;
  attachments?: Array<{ name: string; size?: string; ext?: string; isImage?: boolean }>;
};

const fallbackRoom: Room = {
  code: 'SP-7942', name: 'Design Alignment Sync', topic: 'Product Strategy', participantMode: 'flexible', participantCount: 10,
  notes: 'Please review the attached strategy brief before voting on upcoming questions.',
  groups: [{ id: 1, name: 'Leadership', isSourceOfTruth: true, roles: ['Decision Maker', 'Facilitator'] }, { id: 2, name: 'Engineering', isSourceOfTruth: false, roles: ['Lead Architect', 'Reviewer'] }, { id: 3, name: 'Product', isSourceOfTruth: false, roles: ['Product Owner'] }, { id: 4, name: 'Design', isSourceOfTruth: false, roles: ['UI Designer'] }],
  attachments: [{ name: 'Q3_Product_Strategy_Deck.pdf', size: '2.4 MB', ext: 'PDF' }],
};

export function WaitingPage() {
  const params = useSearchParams();
  const { showToast } = useToast();
  const [room, setRoom] = useState<Room>(fallbackRoom);
  const [elapsed, setElapsed] = useState(45);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const stored = readStored<Partial<Room> | null>('samepage_active_room', null);
    if (stored) window.queueMicrotask(() => setRoom((current) => ({ ...current, ...stored, code: stored.code || current.code })));
    const queryCode = params.get('code');
    if (queryCode) window.queueMicrotask(() => setRoom((current) => ({ ...current, code: queryCode })));
  }, [params]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const duration = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  const copyCode = async () => {
    if (await copyText(room.code)) showToast('Room code copied');
    else showToast('Clipboard permission was not granted', 'error');
  };
  const copyRole = async (value: string, label: string) => {
    if (await copyText(value)) showToast(`${label} copied`);
    else showToast('Clipboard permission was not granted', 'error');
  };

  return (
    <>
      <WaitingPart1 />
      <WaitingPart2 roomCode={room.code} duration={duration} onShare={() => setShareOpen(true)} onCopy={copyCode} />
      <WaitingPart3 room={room} onShare={() => setShareOpen(true)} />
      {shareOpen && <div className="share-roles-overlay" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && setShareOpen(false)}><div className="share-roles-modal" role="dialog" aria-modal="true" aria-labelledby="share-modal-title"><div className="share-roles-header"><div><h3 className="share-modal-title" id="share-modal-title">Role Access Codes &amp; Dedicated Links</h3><p className="share-modal-sub">Send each team or participant their dedicated code below.</p></div><button type="button" className="btn-lightbox-close" onClick={() => setShareOpen(false)} aria-label="Close modal">×</button></div><div className="share-roles-body">{(room.groups?.length ? room.groups : [{ id: 1, name: 'General', isSourceOfTruth: true, roles: ['Participant'] }]).map((group) => { const suffix = group.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'GP'; const code = `${room.code}-${suffix}`; const link = `${window.location.origin}/join?code=${encodeURIComponent(room.code)}&role=${encodeURIComponent(group.roles[0] ?? group.name)}`; return <div className={`share-role-card${group.isSourceOfTruth ? ' sot-card' : ''}`} key={group.id}><div className="share-role-info"><div className="share-role-top"><span className="share-role-badge">{group.isSourceOfTruth ? '★ ' : ''}{group.name}</span><span className="share-code-chip">Role Code: <strong>{code}</strong></span></div><div className="share-role-roles">Auto-assigned: <strong>{group.roles.join(', ') || 'Member'}</strong></div></div><div className="share-role-actions"><button type="button" className="btn-share-copy" onClick={() => copyRole(code, `${group.name} code`)}>Copy Code</button><button type="button" className="btn-share-copy primary" onClick={() => copyRole(link, `${group.name} link`)}>Copy Link</button></div></div>; })}</div></div></div>}
    </>
  );
}
