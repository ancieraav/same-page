import { Suspense } from 'react';
import { PageRoot } from '@/components/layout/PageRoot';
import { ComparisonPage } from '@/components/pages/comparison/ComparisonPage';

export default function DebugQuestionSummaryPage() {
  return (
    <PageRoot bodyClass="viewport-fit-page comparison-body">
      <Suspense fallback={null}>
        <ComparisonPage />
      </Suspense>
    </PageRoot>
  );
}
