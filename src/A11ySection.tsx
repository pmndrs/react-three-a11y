import React, { useContext, useEffect, useRef } from 'react';
import { useThree } from 'react-three-fiber';

interface Props {
  children: React.ReactNode;
  label: string;
  description: string;
}

const A11ySectionContext = React.createContext(undefined);

A11ySectionContext.displayName = 'A11ySectionContext';

const useA11ySectionContext = () => {
  return useContext(A11ySectionContext);
};

export { useA11ySectionContext };

export const A11ySection: React.FC<Props> = ({
  children,
  label,
  description,
}) => {
  const ref = useRef(null);
  const refpDesc = useRef(null);
  const { gl } = useThree();
  const [el] = React.useState(() => document.createElement('section'));
  const target = gl.domElement.parentNode;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (label) {
      el.setAttribute('aria-label', label);
    }
    el.setAttribute('r3f-a11y', 'true');
    if (description) {
      if (refpDesc.current === null) {
        const pDesc = document.createElement('p');
        pDesc.innerHTML = description;
        //sr-only
        pDesc.style.cssText =
          'border: 0!important;clip: rect(1px,1px,1px,1px)!important;-webkit-clip-path: inset(50%)!important;clip-path: inset(50%)!important;height: 1px!important;margin: -1px!important;overflow: hidden!important;padding: 0!important;position: absolute!important;width: 1px!important;white-space: nowrap!important;';
        el.prepend(pDesc);
        //@ts-ignore
        refpDesc.current = pDesc;
      } else {
        //@ts-ignore
        refpDesc.current.innerHTML = description;
      }
    }
  }, [description, label]);

  if (ref.current === null) {
    //@ts-ignore
    target.appendChild(el);
    //@ts-ignore
    ref.current = el;
  }

  return (
    <>
      <A11ySectionContext.Provider
        //@ts-ignore
        value={ref}
      >
        {children}
      </A11ySectionContext.Provider>
    </>
  );
};