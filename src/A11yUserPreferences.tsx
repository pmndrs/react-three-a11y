import React, { useLayoutEffect, useEffect, useState, useContext } from 'react';
import * as ReactDOM from 'react-dom';
interface Props {
  children: React.ReactNode;
  debug: boolean;
}

const A11yUserPreferencesContext = React.createContext({
  a11yPrefersState: {
    prefersReducedMotion: false,
    prefersDarkScheme: false,
  },
  setA11yPrefersState: () => {},
});

A11yUserPreferencesContext.displayName = 'A11yUserPreferencesContext';

const useUserPreferences = () => {
  return useContext(A11yUserPreferencesContext);
};

export { useUserPreferences };

export const A11yUserPreferences: React.FC<Props> = ({ children, debug }) => {
  const [a11yPrefersState, setA11yPrefersState] = useState({
    prefersReducedMotion: false,
    prefersDarkScheme: false,
  });
  const [el] = React.useState(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(el);
    const prefersReducedMotionMediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    const prefersDarkSchemeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    setA11yPrefersState({
      prefersReducedMotion: prefersReducedMotionMediaQuery.matches,
      prefersDarkScheme: prefersDarkSchemeMediaQuery.matches,
    });

    const handleReducedMotionPrefChange = (e: MediaQueryListEvent) => {
      setA11yPrefersState({
        prefersReducedMotion: e.matches,
        prefersDarkScheme: prefersDarkSchemeMediaQuery.matches,
      });
    };
    const handleDarkSchemePrefChange = (e: MediaQueryListEvent) => {
      setA11yPrefersState({
        prefersReducedMotion: prefersReducedMotionMediaQuery.matches,
        prefersDarkScheme: e.matches,
      });
    };

    prefersReducedMotionMediaQuery.addEventListener(
      'change',
      handleReducedMotionPrefChange
    );
    prefersDarkSchemeMediaQuery.addEventListener(
      'change',
      handleDarkSchemePrefChange
    );
    return () => {
      prefersReducedMotionMediaQuery.removeEventListener(
        'change',
        handleReducedMotionPrefChange
      );
      prefersDarkSchemeMediaQuery.removeEventListener(
        'change',
        handleDarkSchemePrefChange
      );
    };
  }, []);

  //@ts-ignore
  let debugWindow = null;
  if (debug) {
    debugWindow = (
      <input
        type="checkbox"
        id="subscribeNews"
        name="subscribe"
        value="newsletter"
      />
    );
  }

  useLayoutEffect(
    //@ts-ignore
    () => void ReactDOM.render(<></>, el)
  );

  return (
    <A11yUserPreferencesContext.Provider
      value={{
        a11yPrefersState: {
          prefersReducedMotion: a11yPrefersState.prefersReducedMotion,
          prefersDarkScheme: a11yPrefersState.prefersDarkScheme,
        },
        //@ts-ignore
        setA11yPrefersState: setA11yPrefersState,
      }}
    >
      {children}
    </A11yUserPreferencesContext.Provider>
  );
};
