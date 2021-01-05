import React from 'react';
import { FocusListener } from './FocusListener';
import { Announcer } from './Announcer';

type Props = {
  children: React.ReactNode;
};

export const A11yDom: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Announcer />
      <FocusListener>{children}</FocusListener>
    </>
  );
};
