import React, { useLayoutEffect, useEffect, useState, useRef } from 'react';
import * as ReactDOM from 'react-dom';
import { useUserPreferences } from './A11yUserPreferences';
interface Props {}

export const A11yDebuger: React.FC<Props> = ({}) => {
  const domStructureRef = useRef(null);
  const [el] = useState(() => document.createElement('div'));
  // ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43848
  // @ts-ignore
  const root = React.useMemo<any>(() => domStructureRef.current && ReactDOM.createRoot(domStructureRef.current), [domStructureRef.current]);
  const [boundingStyle, setBoundingStyle] = useState({});
  const [debugState, setDebugState] = useState({
    prefersDarkScheme: false,
    prefersReducedMotion: false,
  });
  const { a11yPrefersState, setA11yPrefersState } = useUserPreferences();

  useEffect(() => {
    el.style.cssText = 'position:fixed;top:0;left:0;';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    setDebugState({
      prefersDarkScheme: a11yPrefersState.prefersDarkScheme,
      prefersReducedMotion: a11yPrefersState.prefersReducedMotion,
    });
    const selectActiveEl = () => {
      console.log('focused: ', document.activeElement);
      let r3fa11ydebugidref = document.activeElement?.getAttribute(
        'r3f-a11y-debug-id'
      );
      if (r3fa11ydebugidref) {
        document.querySelectorAll('[r3fa11ydebugidref]').forEach(node => {
          //@ts-ignore
          node.style.color = null;
        });
        let refEl = document.querySelector(
          '[r3fa11ydebugidref="' + r3fa11ydebugidref + '"]'
        );
        if (refEl) {
          //@ts-ignore
          refEl.style.color = 'red';
        }
      }
    };
    console.log('enregistre ev');
    document.addEventListener('focus', selectActiveEl, true);
    let superinterval = window.setInterval(() => {
      let r3fPosId = 0;
      //@ts-ignore
      let elements = [];
      document.querySelectorAll('[r3f-a11y]').forEach(node => {
        node.setAttribute('r3f-a11y-debug-id', '' + r3fPosId);
        // let li = document.createElement('li');
        // li.innerHTML = node.tagName ;
        // //@ts-ignore
        // domStructureRef.current.appendChild(li);
        elements.push(
          //@ts-ignore
          <li key={r3fPosId} r3fa11ydebugidref={r3fPosId}>
            {node.tagName}
            <button
              tabIndex={-1}
              onClick={() => {
                console.log(node);
                let clientRect = node.getBoundingClientRect();
                setBoundingStyle({
                  width: clientRect.width,
                  height: clientRect.height,
                  top: clientRect.top,
                  left: clientRect.left,
                });
              }}
            >
              Show
            </button>
          </li>
        );
        r3fPosId++;
      });
      //@ts-ignore
      if (root) root.render(<>{elements}</>);
    }, 2000);
    return () => {
      clearInterval(superinterval);
      if (root) root.unmount();
      console.log('remove ev');
      document.removeEventListener('focus', selectActiveEl, true);
    };
  }, [a11yPrefersState]);

  // @ts-ignore
  const handleChange = e => {
    // @ts-ignore
    setA11yPrefersState({
      prefersDarkScheme:
        e.target.name === 'prefersDarkScheme'
          ? e.target.checked
          : debugState.prefersDarkScheme,
      prefersReducedMotion:
        e.target.name === 'prefersReducedMotion'
          ? e.target.checked
          : debugState.prefersReducedMotion,
    });
  };

  useLayoutEffect(() => {
    return void root && root.render(
      <>
        <label>
          Prefer dark mode
          <input
            type="checkbox"
            name="prefersDarkScheme"
            checked={debugState.prefersDarkScheme}
            onChange={handleChange}
          />
        </label>
        <label>
          Prefer reduced motion
          <input
            type="checkbox"
            name="prefersReducedMotion"
            checked={debugState.prefersReducedMotion}
            onChange={handleChange}
          />
        </label>
        <h3>R3F Dom order</h3>
        <ul ref={domStructureRef}></ul>
        <div
          style={Object.assign(
            {
              position: 'absolute' as const,
              border: '1px solid white',
              borderRadius: '50%',
              background:
                'linear-gradient( 45deg, rgb(70, 255, 60, 0.7), rgb(0, 64, 193, 0.7))',
              pointerEvents: 'none' as const,
              transition: 'all 200ms ease',
            },
            boundingStyle
          )}
        ></div>
      </>,
      el
    );
  });

  return <></>;
};
