'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type AccessibleModalProps = {
  open: boolean;
  labelledBy: string;
  className: string;
  onClose: () => void;
  children: ReactNode;
};

export function AccessibleModal({ open, labelledBy, className, onClose, children }: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={className} role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  );
}
