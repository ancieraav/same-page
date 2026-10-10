import { PageRoot } from '@/components/layout/PageRoot';
import { AnalyticsPage } from '@/components/pages/analytics/AnalyticsPage';

export default function DebugRoomSummaryPage() {
  return (
    <PageRoot bodyClass="viewport-fit-page analytics-body">
      <AnalyticsPage />
    </PageRoot>
  );
}
