import React, { useEffect, useRef, useState, useContext } from 'react';
import { useThree } from 'react-three-fiber';
import useFocusStore from './focusStore';

import useAnnounceStore from './announceStore';

interface Props {
  children: React.ReactNode;
  title: string;
  anchorId: string | undefined;
  href: string | undefined;
  role: 'button' | 'link' | 'content';
  actionCall: () => void;
  focusCall: (children: React.ReactNode) => void;
}

const A11yContext = React.createContext({ focus: false, hover: false });
A11yContext.displayName = 'A11yContext';

const useA11y = () => {
  return useContext(A11yContext);
};

export { useA11y };

export const A11y: React.FC<Props> = ({
  children,
  title,
  anchorId,
  href,
  role,
  actionCall,
  focusCall,
  ...props
}) => {
  const group = useRef();
  const [a11yState, setA11yState] = useState({
    hovered: false,
    focused: false,
  });
  const addFocusable = useFocusStore(state => state.addFocusable);
  const removeFocusable = useFocusStore(state => state.removeFocusable);
  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);
  const removeFocus = useFocusStore(state => state.removeFocus);

  if (group.current) {
    // @ts-ignore
    console.log('rendering ' + group.current.uuid);
  }

  const {
    gl: { domElement },
  } = useThree();

  // temporary fix to prevent error -> keep track of our component's mounted state
  const componentIsMounted = useRef(true);
  useEffect(() => {
    // @ts-ignore
    group.current = { uuid: '' };
    // @ts-ignore
    group.current.uuid = addFocusable({
      // @ts-ignore
      uuid: null,
      role: role,
      title: title,
      anchorId: anchorId,
      href: href,
      actionCall: actionCall,
      focusCall: focusCall,
    });
    // @ts-ignore
    console.log('is mounting ' + group.current.uuid);
    const unsubfocus = useFocusStore.subscribe(
      val => {
        console.log('anchorid = ' + anchorId + ' val = ', val);
        if (val) {
          if (typeof focusCall === 'function') focusCall(children);
        }
        // @ts-ignore
        setA11yState({ hovered: a11yState.hovered, focused: val });
      },
      // @ts-ignore
      state => (group.current ? state[group.current.uuid] : null)
    );

    return () => {
      // @ts-ignore
      console.warn('unmount ' + group.current.uuid);
      // @ts-ignore
      removeFocusable(group.current.uuid);
      unsubfocus();
      domElement.style.cursor = 'default';
      componentIsMounted.current = false;
    };
  }, []); // Using an empty dependency array ensures this on

  if (a11yState.hovered || a11yState.focused) {
    a11yScreenReader(title);
  }
  if (a11yState.hovered) {
    domElement.style.cursor = 'pointer';
  } else {
    domElement.style.cursor = 'default';
  }

  return (
    <A11yContext.Provider
      value={{ hover: a11yState.hovered, focus: a11yState.focused }}
    >
      <group
        {...props}
        onClick={actionCall}
        onPointerOver={() =>
          setA11yState({ hovered: true, focused: a11yState.focused })
        }
        onPointerOut={() => {
          // temporary fix to prevent error -> keep track of our component's mounted state
          if (componentIsMounted.current) {
            setA11yState({ hovered: false, focused: a11yState.focused });
          }
        }}
        onPointerMissed={() => removeFocus()}
      >
        {children}
      </group>
    </A11yContext.Provider>
  );
};
