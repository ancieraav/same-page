import type { Metadata } from 'next';
import { PageRoot } from '@/components/layout/PageRoot';
import { ParticipantsPage } from '@/components/pages/participants/ParticipantsPage';

export const metadata: Metadata = {
  title: 'Team Perspectives & Individual Analytics | SamePage',
  description: 'Detailed perspectives and individual analytics.',
};

export default function ParticipantsRoute() {
  return <PageRoot bodyClass="viewport-fit-page analytics-body"><ParticipantsPage /></PageRoot>;
}
