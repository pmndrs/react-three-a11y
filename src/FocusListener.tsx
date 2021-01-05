import React, { KeyboardEvent, MouseEvent } from 'react';
import { useFocusStore } from './focusStore';

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

export const FocusListener: React.FC = ({ ...props }) => {
  const focusNext = useFocusStore(state => state.focusNext);
  const removeFocus = useFocusStore(state => state.removeFocus);
  const triggerClick = useFocusStore(state => state.triggerClick);
  const setHasFocusControl = useFocusStore(state => state.setHasFocusControl);
  const indexfocusedItem = useFocusStore(state => state.currentIndex);

  function handleKeydown(e: KeyboardEvent<HTMLButtonElement>) {
    // @ts-ignore
    if (e.key === 'Tab' && !e.altKey) {
      if (e.shiftKey) {
        focusNext(e, -1);
      } else {
        focusNext(e, 1);
      }
    }
    //triggered by ctrl + enter
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerClick();
    }
  }
  function handleClick(
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) {
    if (e.detail === 0) {
      //enter pressed
      e.preventDefault();
      triggerClick();
    } else {
      removeFocus();
    }
  }

  return (
    <button
      onKeyDown={handleKeydown}
      onClick={handleClick}
      onFocus={e => {
        setHasFocusControl(true);
        if (indexfocusedItem === -1) {
          focusNext(e, 1);
        }
      }}
      onBlur={() => {
        removeFocus();
        setHasFocusControl(false);
      }}
      focus-listener="true"
      // @ts-ignore
      style={offScreenStyle}
      type="button"
      {...props}
    ></button>
  );
};
