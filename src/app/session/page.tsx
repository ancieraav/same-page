import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageRoot } from '@/components/layout/PageRoot';
import { SessionPage } from '@/components/pages/session/SessionPage';

export const metadata: Metadata = {
  title: 'Session Active | Question 1 - Same Page',
  description: 'Answer the active alignment question.',
};

export default function SessionRoute() {
  return <PageRoot bodyClass="viewport-fit-page session-body"><Suspense fallback={null}><SessionPage /></Suspense></PageRoot>;
}
