import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageRoot } from '@/components/layout/PageRoot';
import { WaitingPage } from '@/components/pages/waiting/WaitingPage';

export const metadata: Metadata = {
  title: 'Same Page — Waiting Room',
  description: 'Wait for participants to join your private Same Page session.',
};

export default function WaitingRoute() {
  return <PageRoot bodyClass="scrollable-page waiting-page-body"><Suspense fallback={null}><WaitingPage /></Suspense></PageRoot>;
}
