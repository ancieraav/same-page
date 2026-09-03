import type { ReactNode } from 'react';

interface PageRootProps {
  bodyClass?: string;
  children: ReactNode;
}

/**
 * Route-level visual context. The class is rendered in the tree so styling is
 * deterministic during SSR without relying on browser-only global state.
 */
export function PageRoot({ bodyClass = '', children }: PageRootProps) {
  return <div className={`page-root ${bodyClass}`.trim()}>{children}</div>;
}
