import React, { useEffect, useState, useContext } from 'react';
interface Props {
  children: React.ReactNode;
}

type aasetA11yPrefersState = {
  prefersReducedMotion: boolean;
  prefersDarkScheme: boolean;
};

const A11yUserPreferencesContext = React.createContext({
  a11yPrefersState: {
    prefersReducedMotion: false,
    prefersDarkScheme: false,
  },
  // tslint:disable:no-unused-variable
  setA11yPrefersState: (_state: aasetA11yPrefersState) => {},
  // tslint:enable:no-unused-variable
});

A11yUserPreferencesContext.displayName = 'A11yUserPreferencesContext';

const useUserPreferences = () => {
  return useContext(A11yUserPreferencesContext);
};

export { useUserPreferences, A11yUserPreferencesContext };

export const A11yUserPreferences: React.FC<Props> = ({ children }) => {
  const [a11yPrefersState, setA11yPrefersState] = useState({
    prefersReducedMotion: false,
    prefersDarkScheme: false,
  });

  useEffect(() => {
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

    if (typeof prefersReducedMotionMediaQuery.addEventListener === 'function') {
      prefersReducedMotionMediaQuery.addEventListener(
        'change',
        handleReducedMotionPrefChange
      );
    }
    if (typeof prefersDarkSchemeMediaQuery.addEventListener === 'function') {
      prefersDarkSchemeMediaQuery.addEventListener(
        'change',
        handleDarkSchemePrefChange
      );
    }
    return () => {
      if (
        typeof prefersReducedMotionMediaQuery.removeEventListener === 'function'
      ) {
        prefersReducedMotionMediaQuery.removeEventListener(
          'change',
          handleReducedMotionPrefChange
        );
      }
      if (
        typeof prefersDarkSchemeMediaQuery.removeEventListener === 'function'
      ) {
        prefersDarkSchemeMediaQuery.removeEventListener(
          'change',
          handleDarkSchemePrefChange
        );
      }
    };
  }, []);

  return (
    <A11yUserPreferencesContext.Provider
      value={{
        a11yPrefersState: {
          prefersReducedMotion: a11yPrefersState.prefersReducedMotion,
          prefersDarkScheme: a11yPrefersState.prefersDarkScheme,
        },
        setA11yPrefersState: setA11yPrefersState,
      }}
    >
      {children}
    </A11yUserPreferencesContext.Provider>
  );
};
