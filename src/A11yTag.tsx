//https://raw.githubusercontent.com/pmndrs/drei/master/src/web/Html.tsx
import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { Group } from 'three';
import { Assign } from 'utility-types';
import { ReactThreeFiber, useThree } from '@react-three/fiber';
import isDeepEqual from 'fast-deep-equal/react';

const A11yTagContext = React.createContext<
  React.MutableRefObject<HTMLElement | null>
>(React.createRef());

A11yTagContext.displayName = 'A11yTagContext';

const useA11yTagContext = () => {
  return React.useContext(A11yTagContext);
};

export { useA11yTagContext };

export interface HtmlProps
  extends Omit<
    Assign<
      React.HTMLAttributes<HTMLDivElement>,
      ReactThreeFiber.Object3DNode<Group, typeof Group>
    >,
    'ref'
  > {
  eps?: number;
  tag?: string;
  portal?: React.MutableRefObject<HTMLElement>;
  zIndexRange?: Array<number>;
  a11yElAttr?: Object;
}

export const A11yTag = ({
  children,
  eps = 0.001,
  style,
  className,
  portal,
  zIndexRange = [16777271, 0],
  tag = 'div',
  a11yElAttr,
  ...props
}: HtmlProps) => {
  const gl = useThree(({ gl }) => gl);
  const [el] = React.useState(() => document.createElement(tag));
  const group = React.useRef<Group>(null);

  const tagContext = useA11yTagContext();
  const target = tagContext?.current ?? gl.domElement.parentNode;
  const elRef = React.useRef<HTMLElement | null>(null);

  const a11yElAttrRef = React.useRef(a11yElAttr);
  if (!isDeepEqual(a11yElAttrRef.current, a11yElAttr)) {
    a11yElAttrRef.current = a11yElAttr;
  }

  React.useEffect(() => {
    if (group.current) {
      el.style.cssText = `position:absolute;top:0;left:0;`;

      return () => {
        elRef.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  React.useEffect(() => {
    if (group.current) {
      if (a11yElAttr) {
        for (const property in a11yElAttr) {
          el.setAttribute(
            property.replace(/[A-Z]/g, m => '-' + m.toLowerCase()),
            //@ts-ignore
            a11yElAttr[property]
          );
        }
      }
      return () => {};
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a11yElAttrRef.current]);

  if (target && target !== el.parentElement) {
    if (!document.body.contains(el)) {
      target.appendChild(el);
    }
  }
  elRef.current = el;

  return (
    <>
      <A11yTagContext.Provider value={elRef}>
        <group {...props} ref={group}>
          {children}
        </group>
      </A11yTagContext.Provider>
    </>
  );
};
