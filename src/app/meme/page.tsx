import type { Metadata } from 'next';
import { PageRoot } from '@/components/layout/PageRoot';
import { MemePage } from '@/components/pages/meme/MemePage';

export const metadata: Metadata = {
  title: 'Meme Intermission — Same Page',
  description: 'A short room intermission.',
};

export default function MemeRoute() {
  return <PageRoot bodyClass="viewport-fit-page meme-body"><MemePage /></PageRoot>;
}
