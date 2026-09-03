import type { Metadata } from 'next';
import { IndexPage } from '@/components/pages/index/IndexPage';
import { PageRoot } from '@/components/layout/PageRoot';

export const metadata: Metadata = {
  title: 'Same Page — Join or Create Room',
  description: 'Collaborate and align your team in seconds with Same Page.',
};

export default function HomePage() {
  return (
    <PageRoot bodyClass="no-scroll">
      <IndexPage />
    </PageRoot>
  );
}
