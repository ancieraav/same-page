import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageRoot } from '@/components/layout/PageRoot';
import { JoinPage } from '@/components/pages/join/JoinPage';

export const metadata: Metadata = {
  title: 'Set Your Room Identity - Same Page',
  description: 'Set your display name and profile photo before joining the session.',
};

export default function JoinRoute() {
  return <PageRoot bodyClass="join-body"><Suspense fallback={null}><JoinPage /></Suspense></PageRoot>;
}
