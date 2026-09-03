import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { CreateHeader } from './CreateHeader';
import { CreateRoomForm } from './CreateRoomForm';

export function CreatePage() {
  return (
    <>
      <AmbientBackground />
      <CreateHeader />
      <CreateRoomForm />
    </>
  );
}
