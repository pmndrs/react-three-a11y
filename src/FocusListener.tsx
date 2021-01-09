import React, { useEffect } from 'react';
import useFocusStore from './focusStore';

export const FocusListener: React.FC = ({ children }) => {
  const setRequestedAnchorId = useFocusStore(
    state => state.setRequestedAnchorId
  );

  // const [lastFocusedBtn, setLastFocusedBtn] = useState('');

  console.log('is rendering dom listenrs');
  useEffect(() => {
    console.log('setRequestedAnchorId');
    setRequestedAnchorId(window.location.hash.replace('#', ''));
  });

  return (
    <>
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
