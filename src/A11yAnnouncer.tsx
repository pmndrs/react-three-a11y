import React from 'react';
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
  const message = useAnnounceStore(state => state.message);

  return (
    <div style={offScreenStyle} aria-atomic="true" aria-live="assertive">
      {message}
    </div>
  );
};
