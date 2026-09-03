'use client';

import { useState } from 'react';
import { AnalyticsHeader } from './AnalyticsHeader';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export function AnalyticsPage() {
  const [summaryOpen, setSummaryOpen] = useState(false);
  return (
    <>
      <AnalyticsHeader />
      <AnalyticsDashboard
        summaryOpen={summaryOpen}
        onToggleSummary={() => setSummaryOpen((value) => !value)}
      />
    </>
  );
}
