//https://raw.githubusercontent.com/pmndrs/drei/master/src/web/Html.tsx
import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { Group } from 'three';
import { Assign } from 'utility-types';
import { ReactThreeFiber, useThree } from '@react-three/fiber';

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
}

export const A11yTag = React.forwardRef(
  ({
    children,
    eps = 0.001,
    style,
    className,
    portal,
    zIndexRange = [16777271, 0],
    tag = 'div',
    ...props
  }: HtmlProps) =>
    // ref: React.Ref<HTMLDivElement>
    {
      const gl = useThree(({ gl }) => gl);
      const [el] = React.useState(() => document.createElement(tag));
      const group = React.useRef<Group>(null);

      const tagContext = useA11yTagContext();
      const target = tagContext?.current ?? gl.domElement.parentNode;
      const elRef = React.useRef<HTMLElement | null>(null);

      React.useEffect(() => {
        if (group.current) {
          el.style.cssText = `position:absolute;top:0;left:0;`;
          return () => {
            elRef.current = null;
          };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [target]);

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
    }
);
