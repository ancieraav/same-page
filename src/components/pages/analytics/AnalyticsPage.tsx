'use client';

import { useState } from 'react';
import { AnalyticsPart1 } from './AnalyticsPart1';
import { AnalyticsPart2 } from './AnalyticsPart2';

export function AnalyticsPage() {
  const [summaryOpen, setSummaryOpen] = useState(false);
  return <><AnalyticsPart1 /><AnalyticsPart2 summaryOpen={summaryOpen} onToggleSummary={() => setSummaryOpen((value) => !value)} /></>;
}
