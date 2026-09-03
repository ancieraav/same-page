'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readStored, removeStored, writeStored } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { ProfileHeader } from './ProfileHeader';
import { ProfileForm } from './ProfileForm';
import { DeleteAccountModal } from './DeleteAccountModal';

interface Profile { name: string; age: number; photo: string }
const defaultProfile: Profile = { name: 'Alex Morgan', age: 28, photo: '' };

export function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const stored = readStored('samepage_user_profile', defaultProfile);
    window.queueMicrotask(() => { setProfile(stored); });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setDeleteOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); };
  }, []);

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Maximum file size is 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    const onLoad = () => {
      setProfile((current) => ({
        ...current,
        photo: typeof reader.result === 'string' ? reader.result : '',
      }));
      reader.removeEventListener('load', onLoad);
    };
    reader.addEventListener('load', onLoad);
    reader.readAsDataURL(file);
  };

  const save = () => {
    const name = profile.name.trim();
    if (!name) {
      showToast('Please enter your name', 'error');
      return;
    }
    const next = { ...profile, name, age: Math.min(120, Math.max(10, profile.age)) };
    setProfile(next);
    writeStored('samepage_user_profile', next);
    showToast('Profile saved');
  };

  const confirmDelete = () => {
    removeStored('samepage_user_profile');
    removeStored('samepage_active_room');
    removeStored('samepage_user_answer');
    removeStored('samepage_user_answer_q1');
    removeStored('samepage_user_answer_q2');
    setDeleteOpen(false);
    showToast('Account data removed');
    window.setTimeout(() => { router.push('/'); }, 450);
  };

  return (
    <>
      <ProfileHeader
        name={profile.name}
        age={profile.age}
        avatarSrc={profile.photo}
        dropdownOpen={dropdownOpen}
        onToggle={() => { setDropdownOpen((value) => !value); }}
        onLogout={() => {
          setDropdownOpen(false);
          showToast('Logged out');
          router.push('/');
        }}
      />
      <ProfileForm
        name={profile.name}
        age={profile.age}
        avatarSrc={profile.photo}
        fileInputRef={fileInputRef}
        onAvatarTrigger={() => fileInputRef.current?.click()}
        onAvatarChange={onAvatarChange}
        onNameChange={(name) => { setProfile((current) => ({ ...current, name })); }}
        onAgeChange={(age) => { setProfile((current) => ({ ...current, age })); }}
        onSave={save}
        onDelete={() => { setDeleteOpen(true); }}
      />
      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
