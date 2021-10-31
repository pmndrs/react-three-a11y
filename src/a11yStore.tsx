import create from 'zustand';

type State = {
  a11yObj: Array<
    React.Dispatch<
      React.SetStateAction<{
        hovered: boolean;
        focused: boolean;
        pressed: boolean;
        autoUpdate: boolean;
        needUpdate: boolean;
      }>
    >
  >;
  registerA11YObj: (
    a11yObj: React.Dispatch<
      React.SetStateAction<{
        hovered: boolean;
        focused: boolean;
        pressed: boolean;
        autoUpdate: boolean;
        needUpdate: boolean;
      }>
    >
  ) => void;
};

const useA11yStore = create<State>(set => {
  return {
    a11yObj: [],
    registerA11YObj: a11yObj => {
      set(state => {
        let newA11yObj = state.a11yObj;
        newA11yObj.push(a11yObj);

        return {
          a11yObj: newA11yObj,
        };
      });
    },
  };
});

export default useA11yStore;
