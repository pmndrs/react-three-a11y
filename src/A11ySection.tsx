import React, {
  useContext,
  useEffect,
  useRef,
  MutableRefObject,
  createRef,
} from 'react';
import { useThree } from '@react-three/fiber';
import { stylesHiddenButScreenreadable } from './A11yConsts';

interface Props {
  children: React.ReactNode;
  label: string;
  description: string;
}

const A11ySectionContext = React.createContext<
  MutableRefObject<HTMLElement | null>
>(createRef());

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
  const ref = useRef<HTMLElement | null>(null);
  const refpDesc = useRef<HTMLParagraphElement | null>(null);
  const gl = useThree((state) => state.gl);
  const [el] = React.useState(() => document.createElement('section'));
  const target = gl.domElement.parentNode;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (label) {
      el.setAttribute('aria-label', label);
    }
    el.setAttribute('r3f-a11y', 'true');
    el.setAttribute(
      'style',
      ((styles) => {
        return Object.keys(styles).reduce(
          (acc, key) =>
            acc +
            key
              .split(/(?=[A-Z])/)
              .join('-')
              .toLowerCase() +
            ':' +
            (styles as any)[key] +
            ';',
          ''
        );
      })(stylesHiddenButScreenreadable)
    );
    if (description) {
      if (refpDesc.current === null) {
        const pDesc = document.createElement('p');
        pDesc.innerHTML = description;
        pDesc.style.cssText =
          'border: 0!important;clip: rect(1px,1px,1px,1px)!important;-webkit-clip-path: inset(50%)!important;clip-path: inset(50%)!important;height: 1px!important;margin: -1px!important;overflow: hidden!important;padding: 0!important;position: absolute!important;width: 1px!important;white-space: nowrap!important;';
        el.prepend(pDesc);
        refpDesc.current = pDesc;
      } else {
        refpDesc.current.innerHTML = description;
      }
    }
    return () => {
      if (target) target.removeChild(el);
    };
  }, [description, label]);

  if (ref.current === null) {
    if (target) {
      target.appendChild(el);
    }
    ref.current = el;
  }

  return (
    <>
      <A11ySectionContext.Provider value={ref}>
        {children}
      </A11ySectionContext.Provider>
    </>
  );
};
