import { useEffect, useRef, useState, Children, cloneElement } from 'react';
import { useThree} from 'react-three-fiber';
import useFocusStore from './focusStore';
import type { Group } from 'three';
import React from "react";
import useAnnounceStore from './announceStore';

type Props = {
  children: React.ReactNode;
  focusable: boolean;
  title: string;
  actionCall: () => void;
  focusCall: (children: React.ReactNode) => void;
};

export const A11y: React.FC<Props> = ({ children,focusable, title, actionCall, focusCall, ...props }) => {
  const group = useRef<Group>();
  const [hovered, setHover] = useState(false);
  const focusedEl = focusable ? useFocusStore(state => state.focusedEl) : null;
  const clickedEl = focusable ? useFocusStore(state => state.clickedEl) : null;
  const addFocusable = focusable ? useFocusStore(state => state.addFocusable) : null;
  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);
  const removeFocus = useFocusStore(state => state.removeFocus);
  let focused = false;
  let clicked = false;

  if (group.current) {
    if(focusable){
        focused = group.current.uuid === focusedEl;
        clicked = group.current.uuid === clickedEl;
    }
    console.log('rendering '+group.current.uuid);
  }

  if (clicked) {
    if(typeof actionCall === 'function' )
    actionCall();
  }

  if (focused){
    //todo make sur it doesn't call it on each render, has to run only once when it receive focus 
    if(typeof focusCall === 'function' )
    focusCall(children);
  }

  const {
    gl: { domElement },
  } = useThree();

  // temporary fix to prevent error -> keep track of our component's mounted state
  const componentIsMounted = useRef(true);
  useEffect(() => {
    if(focusable){
      // @ts-ignore
      addFocusable(group.current.uuid);
    }
    return () => {
      domElement.style.cursor = 'default';
      componentIsMounted.current = false;
    };
  }, []); // Using an empty dependency array ensures this on

  if (hovered || focused) {
    a11yScreenReader(title)
  }
  if (hovered) {
    domElement.style.cursor = 'pointer';
  } else {
    domElement.style.cursor = 'default';
  }

  const childrenWithExtraProp = Children.map<React.ReactNode, React.ReactNode>(children, child => {

    return cloneElement(child  as React.ReactElement<any>, { a11yHasFocus: focused, a11yHasHover:hovered })
  }
  );

  return (
    <group
      ref={group}
      {...props}
      onClick={() => {
        actionCall
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => {
        // temporary fix to prevent error -> keep track of our component's mounted state
        if (componentIsMounted.current) {
          setHover(false);
        }
      }}
      onPointerMissed={() => removeFocus()}
    >
      {childrenWithExtraProp}
    </group>
  );
};
