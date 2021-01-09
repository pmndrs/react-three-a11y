import React, { MouseEvent, useEffect } from 'react';
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

export const FocusListener: React.FC = ({ children }) => {
  // const focusNext = useFocusStore(state => state.focusNext);
  const focusByUuid = useFocusStore(state => state.focusByUuid);
  const blurByUuid = useFocusStore(state => state.blurByUuid);
  const focusableItems = useFocusStore(state => state.focusableItems);
  // const removeFocus = useFocusStore(state => state.removeFocus);
  const triggerClick = useFocusStore(state => state.triggerClick);
  // const setHasFocusControl = useFocusStore(state => state.setHasFocusControl);
  // const getCurrentIndex = useFocusStore(state => state.getCurrentIndex);
  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);
  const setRequestedAnchorId = useFocusStore(
    state => state.setRequestedAnchorId
  );

  // const [lastFocusedBtn, setLastFocusedBtn] = useState('');

  console.log('is rendering dom listenrs');
  useEffect(() => {
    console.log('setRequestedAnchorId');
    setRequestedAnchorId(window.location.hash.replace('#', ''));
  });

  function handleClick(
    e:
      | MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
      | MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    uuid: string
  ) {
    e.preventDefault();
    triggerClick(uuid);
  }

  function handleBtnClick(item: Object) {
    //msg is the same need to be clean for it to trigger again in case of multiple press in a row
    a11yScreenReader('');
    window.setTimeout(() => {
      // @ts-ignore
      a11yScreenReader(item.activationMsg);
    }, 10);
    // @ts-ignore
    triggerClick(item.uuid);
  }

  function handleToggleBtnClick(
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    item: Object
  ) {
    // @ts-ignore
    if (e.target.getAttribute('aria-pressed') === 'true') {
      // @ts-ignore
      e.target.setAttribute('aria-pressed', 'false');
      // @ts-ignore
      a11yScreenReader(item.desactivationMsg);
    } else {
      // @ts-ignore
      e.target.setAttribute('aria-pressed', 'true');
      // @ts-ignore
      a11yScreenReader(item.activationMsg);
    }
    // @ts-ignore
    triggerClick(item.uuid);
  }

  const a11yelements = focusableItems.map(item => {
    if (item.role === 'button') {
      if (item.desactivationMsg) {
        //btn has two distinct state
        return (
          <button
            aria-pressed="false"
            // @ts-ignore
            style={offScreenStyle}
            key={item.uuid}
            onClick={e => handleToggleBtnClick(e, item)}
            onFocus={() => {
              focusByUuid(item.uuid);
            }}
            onBlur={() => {
              blurByUuid(item.uuid);
            }}
          >
            {item.title}
          </button>
        );
      } else {
        //regular btn
        return (
          <button
            // @ts-ignore
            style={offScreenStyle}
            key={item.uuid}
            onClick={() => handleBtnClick(item)}
            onFocus={() => {
              focusByUuid(item.uuid);
            }}
            onBlur={() => {
              blurByUuid(item.uuid);
            }}
          >
            {item.title}
          </button>
        );
      }
    } else if (item.role === 'link') {
      return (
        <a
          // @ts-ignore
          style={offScreenStyle}
          href={item.href}
          key={item.uuid}
          onClick={e => {
            e.preventDefault();
            handleClick(e, item.uuid);
          }}
          onFocus={() => {
            focusByUuid(item.uuid);
          }}
          onBlur={() => {
            blurByUuid(item.uuid);
          }}
        >
          {item.title}
        </a>
      );
    } else {
      return (
        <p
          // @ts-ignore
          style={offScreenStyle}
          tabIndex={0}
          key={item.uuid}
          onBlur={() => {
            blurByUuid(item.uuid);
          }}
          onFocus={() => {
            focusByUuid(item.uuid);
          }}
        >
          {item.title}
        </p>
      );
    }
  });

  console.log(a11yelements);

  return (
    <>
      {a11yelements}
      {/* <button
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
      ></button> */}
      {children}
      {/* <button
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
      ></button> */}
    </>
  );
};
