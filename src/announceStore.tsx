import create from 'zustand';

type State = {
  message: string;
  a11yScreenReader: (message: string) => void;
};

const useAnnounceStore = create<State>((set) => {
  return {
    message: '',
    a11yScreenReader: (message) => {
      set(() => {
        return { message: message };
      });
    },
  };
});

export default useAnnounceStore;
