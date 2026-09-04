'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LiveSessionPage } from './LiveSessionPage';

export function SessionPage() {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get('code');
  useEffect(() => {
    if (!code) router.replace('/');
  }, [code, router]);
  if (!code) return null;
  return <LiveSessionPage code={code} />;
}
