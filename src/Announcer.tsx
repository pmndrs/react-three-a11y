import React from 'react';
import useAnnounceStore from './announceStore';

const offScreenStyle = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: 0,
  width: '1px',
  position: 'absolute',
};

export const Announcer: React.FC = ({ ...props }) => {
  const message = useAnnounceStore(state => state.message);

  return (
    <div
      // @ts-ignore
      style={offScreenStyle}
      aria-atomic="true"
      aria-live="polite"
      {...props}
    >
      {message}
    </div>
  );
};
