import React, { useEffect } from 'react';
import useAnnounceStore from './announceStore';

const offScreenStyle = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  whiteSpace: 'nowrap' as const,
  padding: 0,
  width: '1px',
  position: 'absolute' as const,
};

export const A11yAnnouncer: React.FC = () => {
  const message = useAnnounceStore((state) => state.message);

  useEffect(() => {
    const mouseClickListener = (e: MouseEvent) => {
      if (
        window.document.activeElement?.getAttribute('r3f-a11y') &&
        e.detail !== 0
      ) {
        if (window.document.activeElement instanceof HTMLElement) {
          window.document.activeElement.blur();
        }
      }
    };
    window.addEventListener('click', mouseClickListener);
    return () => {
      window.removeEventListener('click', mouseClickListener);
    };
  });

  return (
    <div style={offScreenStyle} aria-atomic="true" aria-live="polite">
      {message}
    </div>
  );
};
