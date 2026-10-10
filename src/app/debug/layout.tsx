import type { Metadata } from 'next';
import { assertDebugMode } from '@/lib/debugGuard';

export const metadata: Metadata = {
  title: 'UI Debug Hub — Same Page',
  description: 'Isolated UI testing and debugging surfaces.',
  robots: { index: false, follow: false },
};

export default function DebugLayout({ children }: { children: React.ReactNode }) {
  assertDebugMode();
  return <>{children}</>;
}
