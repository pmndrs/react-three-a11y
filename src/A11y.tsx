import { useEffect, useRef, useState, useContext } from 'react';
import { useThree } from 'react-three-fiber';
import useFocusStore from './focusStore';
import React from 'react';
import useAnnounceStore from './announceStore';

interface Props {
  children: React.ReactNode;
  title: string;
  anchorId: string;
  role: 'button' | 'link' | 'content';
  actionCall: () => void;
  focusCall: (children: React.ReactNode) => void;
}

const A11yContext = React.createContext({ focus: false, hover: false });
A11yContext.displayName = 'A11yContext';

const useA11yContext = () => {
  return useContext(A11yContext);
};

export { useA11yContext };

export const A11y: React.FC<Props> = ({
  children,
  title,
  anchorId,
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
  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);
  const removeFocus = useFocusStore(state => state.removeFocus);
  const getRequestedAnchorId = useFocusStore(
    state => state.getRequestedAnchorId
  );

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
    console.log('is mounting ' + group.current.uuid);
    // @ts-ignore
    addFocusable({ uuid: group.current.uuid, role: role }, actionCall);
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
      state => state[group.current.uuid]
    );

    if (getRequestedAnchorId() === anchorId) {
      if (typeof focusCall === 'function') focusCall(children);
    }
    return () => {
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
        ref={group}
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
