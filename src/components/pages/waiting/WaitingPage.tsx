'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { copyText } from '@/lib/clipboard';
import { readStored } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { WaitingHeader } from './WaitingHeader';
import { WaitingStage } from './WaitingStage';
import { ShareRolesModal } from './ShareRolesModal';

type Room = {
  code: string;
  name: string;
  topic: string;
  notes?: string;
  participantMode?: string;
  participantCount?: number;
  groups?: Array<{ id: number; name: string; isSourceOfTruth: boolean; roles: string[] }>;
  attachments?: Array<{ name: string; size?: string; ext?: string; isImage?: boolean }>;
};

const fallbackRoom: Room = {
  code: 'SP-7942',
  name: 'Design Alignment Sync',
  topic: 'Product Strategy',
  participantMode: 'flexible',
  participantCount: 10,
  notes: 'Please review the attached strategy brief before voting on upcoming questions.',
  groups: [
    { id: 1, name: 'Leadership', isSourceOfTruth: true, roles: ['Decision Maker', 'Facilitator'] },
    { id: 2, name: 'Engineering', isSourceOfTruth: false, roles: ['Lead Architect', 'Reviewer'] },
    { id: 3, name: 'Product', isSourceOfTruth: false, roles: ['Product Owner'] },
    { id: 4, name: 'Design', isSourceOfTruth: false, roles: ['UI Designer'] },
  ],
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
    if (stored) {
      window.queueMicrotask(() =>
        setRoom((current) => ({ ...current, ...stored, code: stored.code || current.code }))
      );
    }
    const queryCode = params.get('code');
    if (queryCode) {
      window.queueMicrotask(() => setRoom((current) => ({ ...current, code: queryCode })));
    }
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
      <AmbientBackground />
      <WaitingHeader
        roomCode={room.code}
        duration={duration}
        onShare={() => setShareOpen(true)}
        onCopy={copyCode}
      />
      <WaitingStage room={room} onShare={() => setShareOpen(true)} />
      {shareOpen && (
        <ShareRolesModal
          roomCode={room.code}
          groups={room.groups}
          onClose={() => setShareOpen(false)}
          onCopyRole={copyRole}
        />
      )}
    </>
  );
}
