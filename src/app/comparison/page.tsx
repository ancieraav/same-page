import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageRoot } from '@/components/layout/PageRoot';
import { ComparisonPage } from '@/components/pages/comparison/ComparisonPage';

export const metadata: Metadata = {
  title: 'Comparison & Alignment Breakdown - Same Page',
  description: 'Compare perspectives and alignment.',
};

export default function ComparisonRoute() {
  return <PageRoot bodyClass="viewport-fit-page comparison-body"><Suspense fallback={null}><ComparisonPage /></Suspense></PageRoot>;
}
