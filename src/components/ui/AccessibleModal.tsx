'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface AccessibleModalProps {
  open: boolean;
  labelledBy: string;
  className: string;
  onClose: () => void;
  children: ReactNode;
}

export function AccessibleModal({ open, labelledBy, className, onClose, children }: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={className}
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <dialog
        ref={dialogRef}
        open
        tabIndex={-1}
        aria-labelledby={labelledBy}
        style={{ background: 'transparent', border: 'none', padding: 0, margin: 'auto', maxWidth: '100%', color: 'inherit' }}
      >
        {children}
      </dialog>
    </div>
  );
}
