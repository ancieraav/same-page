import type { Metadata } from 'next';
import { PageRoot } from '@/components/layout/PageRoot';
import { AnalyticsPage } from '@/components/pages/analytics/AnalyticsPage';

export const metadata: Metadata = {
  title: 'Session Analytics & Alignment Breakdown — Same Page',
  description: 'Comprehensive multi-perspective session analytics.',
};

export default function AnalyticsRoute() {
  return <PageRoot bodyClass="viewport-fit-page analytics-body"><AnalyticsPage /></PageRoot>;
}
