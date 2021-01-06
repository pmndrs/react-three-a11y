import { KeyboardEvent, FocusEvent } from 'react';
import create from 'zustand';

type State = {
  clickedEl: string;
  focusedEl: string;
  focusableItems: string[];
  itemsActions: { (...args: any[]): void }[];
  requestedAnchorId: string;
  currentIndex: number;
  hasFocusControl: boolean;
  setHasFocusControl: (hasFocusControl: boolean) => void;
  triggerClick: () => void;
  removeFocus: () => void;
  focusNext: (
    event: KeyboardEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
    direction: number
  ) => void;
  addFocusable: (uuid: string, actionCall: (...args: any[]) => void) => void;
  removeFocusable: (uuid: string) => void;
  getRequestedAnchorId: () => string;
  getCurrentIndex: () => number;
  setRequestedAnchorId: (anchorId: string) => void;
};

export const useFocusStore = create<State>((set, get) => {
  return {
    clickedEl: '',
    focusedEl: '',
    itemsActions: [],
    focusableItems: [],
    currentIndex: -1,
    requestedAnchorId: '',
    hasFocusControl: false,
    setHasFocusControl: hasFocusControl => {
      set(() => {
        return { hasFocusControl: hasFocusControl };
      });
    },
    triggerClick: () => {
      const curState = get();
      curState.itemsActions[curState.currentIndex]();
      set(state => {
        return { clickedEl: state.focusedEl };
      });
    },
    removeFocus: () => {
      set(state => {
        let newState = {
          currentIndex: -1,
        };
        // @ts-ignore
        newState[state.focusableItems[state.currentIndex]] = false;
        return newState;
      });
    },
    focusNext: (event, direction) => {
      const focusableItems = get().focusableItems;
      if (focusableItems.length > 0) {
        set(state => {
          let newIndex = -1;
          if (direction === 1) {
            newIndex =
              state.currentIndex >= state.focusableItems.length - 1
                ? -1
                : state.currentIndex + 1;
          } else {
            newIndex =
              state.currentIndex === 0
                ? -1
                : state.currentIndex === -1
                ? state.focusableItems.length - 1
                : state.currentIndex - 1;
          }
          if (newIndex !== -1) {
            //if index reach -1, we let the user tab out of the app
            event.preventDefault();
          }
          let newState = {
            currentIndex: newIndex,
            focusedEl: newIndex === -1 ? '' : state.focusableItems[newIndex],
          };
          if (newIndex !== -1) {
            // @ts-ignore
            newState[state.focusableItems[newIndex]] = true;
            // @ts-ignore
            newState[state.focusableItems[state.currentIndex]] = false;
          } else {
            // @ts-ignore
            newState[state.focusableItems[state.currentIndex]] = false;
          }
          return newState;
        });
      }
    },
    addFocusable: (uuid, actionCall) => {
      set(state => {
        return {
          uuid: false,
          focusableItems: [...state.focusableItems, uuid],
          itemsActions: [...state.itemsActions, actionCall],
        };
      });
    },
    removeFocusable: uuid => {
      console.log('remove focusableItems');
      //todo filter array
      set(state => {
        state.focusableItems = state.focusableItems.filter(id => id !== uuid);
        // @ts-ignore
        delete state[uuid];
        return { ...state };
      }, true);
    },
    getRequestedAnchorId: () => {
      return get().requestedAnchorId;
    },
    getCurrentIndex: () => {
      return get().currentIndex;
    },
    setRequestedAnchorId: anchorid => {
      set(() => {
        return { requestedAnchorId: anchorid };
      });
    },
  };
});

// export const useFocusEmulator = (
//   focusNext: State['focusNext'],
//   removeFocus: State['removeFocus'],
//   triggerClick: State['triggerClick']
// ) => {
//   useEffect(() => {
//     function onKeydown(e: KeyboardEvent) {
//       console.log(e.key);
//       if (e.target) {
//         // @ts-ignore
//         if (e.target.id === 'canvasbtn') {
//           if (e.key === 'Tab') {
//             if (e.shiftKey) {
//               focusNext(e, -1);
//             } else {
//               focusNext(e, 1);
//             }
//           }
//           //triggered by ctrl + enter
//           if (e.key === 'Enter') {
//             e.preventDefault();
//             triggerClick();
//           }
//         }
//       }
//     }
//     function handleClick(e: MouseEvent) {
//       console.log(e.detail);
//       if (e.detail === 0) {
//         //enter pressed
//         e.preventDefault();
//         triggerClick();
//       } else {
//         removeFocus();
//       }
//     }
//     const canvasbtn = document.getElementById('canvasbtn');
//     if (canvasbtn) {
//       canvasbtn.addEventListener('keydown', onKeydown);
//       canvasbtn.addEventListener('click', handleClick);
//     }
//     return () => {
//       if (canvasbtn) {
//         canvasbtn.removeEventListener('keydown', onKeydown);
//         canvasbtn.removeEventListener('click', handleClick);
//       }
//     };
//   });
// };

export default useFocusStore;
