import type { Metadata } from 'next';
import { PageRoot } from '@/components/layout/PageRoot';
import { CreatePage } from '@/components/pages/create/CreatePage';

export const metadata: Metadata = {
  title: 'Same Page — Create Room',
  description: 'Create a new private Same Page session with custom rules and roles.',
};

export default function CreateRoute() {
  return <PageRoot bodyClass="scrollable-page"><CreatePage /></PageRoot>;
}
