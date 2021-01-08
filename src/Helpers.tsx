import React from 'react';
import useAnnounceStore from './announceStore';
import useFocusStore from './focusStore';

const messageHelperStyles = {
  bottom: '0px',
  right: '0px',
  position: 'fixed',
  padding: '5px',
  background: '#f3f3f3',
  borderBottom: '1px solid #d8d8d8',
  borderLeft: '1px solid #d8d8d8',
  zIndex: 9999,
};

export const ScreenReaderHelper: React.FC = ({ ...props }) => {
  const message = useAnnounceStore(state => state.message);

  return (
    <div
      // @ts-ignore
      style={messageHelperStyles}
      {...props}
    >
      Current Message {message}
    </div>
  );
};

const FocusHelperStyles = {
  bottom: '20px',
  right: '0px',
  position: 'fixed',
  padding: '5px',
  background: '#f3f3f3',
  borderBottom: '1px solid #d8d8d8',
  borderLeft: '1px solid #d8d8d8',
  zIndex: 9999,
};

export const FocusHelper: React.FC = ({ ...props }) => {
  const focusableItems = useFocusStore(state => state.focusableItems);
  const indexfocusedItem = useFocusStore(state => state.currentIndex);
  const hasFocusControl = useFocusStore(state => state.hasFocusControl);
  const items = focusableItems.map((item, index) => {
    return (
      <li
        style={indexfocusedItem === index ? { color: 'red' } : {}}
        key={item.uuid}
      >
        {item.role} - {item.uuid}
      </li>
    );
  });
  return (
    <div
      // @ts-ignore
      style={FocusHelperStyles}
      {...props}
    >
      Current Focus :{hasFocusControl ? 'Focus in' : 'Focus out'}
      <br />
      Current index : {indexfocusedItem}
      <br />
      Focuable Items :<br />
      <ul>{items}</ul>
    </div>
  );
};
