import create from 'zustand';
import { useEffect } from 'react';

type State = {
  message: string;
  a11yScreenReader: (message: string) => void;
};

const useAnnounceStore = create<State>(set => {
  useEffect(() => {
    window.addEventListener('cick', () => {
      if (window.document.activeElement?.getAttribute('r3f-a11y')) {
        //@ts-ignore
        window.document.activeElement.blur();
      }
    });
  });

  return {
    message: '',
    a11yScreenReader: message => {
      set(() => {
        return { message: message };
      });
    },
  };
});

export default useAnnounceStore;
