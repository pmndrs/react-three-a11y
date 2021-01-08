import React, { KeyboardEvent, MouseEvent, useState, useEffect } from 'react';
import useFocusStore from './focusStore';
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

export const FocusListener: React.FC = ({ children, ...props }) => {
  const focusNext = useFocusStore(state => state.focusNext);
  const focusByUuid = useFocusStore(state => state.focusByUuid);
  const focusableItems = useFocusStore(state => state.focusableItems);
  const removeFocus = useFocusStore(state => state.removeFocus);
  const triggerClick = useFocusStore(state => state.triggerClick);
  const setHasFocusControl = useFocusStore(state => state.setHasFocusControl);
  const getCurrentIndex = useFocusStore(state => state.getCurrentIndex);
  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);
  const setRequestedAnchorId = useFocusStore(
    state => state.setRequestedAnchorId
  );

  const [lastFocusedBtn, setLastFocusedBtn] = useState('');

  console.log('is rendering dom listenrs');
  useEffect(() => {
    console.log('setRequestedAnchorId');
    setRequestedAnchorId(window.location.hash.replace('#', ''));
  });

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
    e:
      | MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
      | MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>
  ) {
    if (e.detail === 0) {
      e.preventDefault();
      triggerClick();
    } else {
      removeFocus();
    }
  }

  const a11yelements = focusableItems.map(item => {
    if (item.role === 'button') {
      return (
        <button
          key={item.uuid}
          onClick={e => handleClick(e)}
          onFocus={() => {
            focusByUuid(item.uuid);
          }}
        ></button>
      );
    } else if (item.role === 'link') {
      return (
        <a
          href="/"
          key={item.uuid}
          onClick={e => {
            e.preventDefault();
            handleClick(e);
          }}
          onFocus={() => {
            focusByUuid(item.uuid);
          }}
        ></a>
      );
    } else {
      return (
        <div
          tabIndex={0}
          key={item.uuid}
          onFocus={() => {
            focusByUuid(item.uuid);
          }}
        ></div>
      );
    }
  });

  console.log(a11yelements);

  return (
    <>
      <button
        onKeyDown={handleKeydown}
        onClick={handleClick}
        tabIndex={lastFocusedBtn === 'postbtn' ? -1 : 0}
        onFocus={e => {
          setLastFocusedBtn('prevbtn');
          setHasFocusControl(true);
          if (getCurrentIndex() === -1) {
            focusNext(e, 1);
          }
        }}
        onBlur={() => {
          setLastFocusedBtn('');
          removeFocus();
          setHasFocusControl(false);
          a11yScreenReader('');
        }}
        focus-listener="true"
        // @ts-ignore
        style={offScreenStyle}
        type="button"
        {...props}
      ></button>
      {children}
      <button
        onKeyDown={handleKeydown}
        onClick={handleClick}
        tabIndex={lastFocusedBtn === 'prevbtn' ? -1 : 0}
        onFocus={e => {
          setLastFocusedBtn('postbtn');
          setHasFocusControl(true);
          if (getCurrentIndex() === -1) {
            focusNext(e, -1);
          }
        }}
        onBlur={() => {
          setLastFocusedBtn('');
          removeFocus();
          setHasFocusControl(false);
          a11yScreenReader('');
        }}
        focus-listener="true"
        // @ts-ignore
        style={offScreenStyle}
        type="button"
        {...props}
      ></button>
    </>
  );
};
