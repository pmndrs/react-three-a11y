import { KeyboardEvent, FocusEvent } from 'react';
import create from 'zustand';

type FocusableItem = {
  uuid: string;
  role: string;
  anchorId: string | undefined;
  title: string | undefined;
  href: string | undefined;
  actionCall: { (...args: any[]): void } | undefined;
  focusCall: { (...args: any[]): void } | undefined;
};

type State = {
  currentId: number;
  clickedEl: string;
  focusedEl: string;
  focusableItems: FocusableItem[];
  requestedAnchorId: string;
  currentIndex: number;
  hasFocusControl: boolean;
  setHasFocusControl: (hasFocusControl: boolean) => void;
  triggerClick: (uuid: string) => void;
  removeFocus: () => void;
  blurByUuid: (uuid: string) => void;
  focusByUuid: (uuid: string) => void;
  focusNext: (
    event: KeyboardEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
    direction: number
  ) => void;
  addFocusable: (item: FocusableItem) => string;
  removeFocusable: (uuid: string) => void;
  getRequestedAnchorId: () => string;
  getCurrentIndex: () => number;
  setRequestedAnchorId: (anchorId: string) => void;
};

const useFocusStore = create<State>((set, get) => {
  return {
    currentId: 0,
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
    triggerClick: uuid => {
      let item = get().focusableItems.find(
        // @ts-ignore
        item => item.uuid === uuid
      );
      if (item && typeof item.actionCall === 'function') item.actionCall();
    },
    removeFocus: () => {
      const focusedEl = get().focusedEl;
      set(state => {
        // @ts-ignore
        if (state[focusedEl]) state[focusedEl] = false;
        return state;
      });
    },
    focusByUuid: uuid => {
      set(() => {
        let newState = {
          focusedEl: uuid,
        };
        // @ts-ignore
        newState[uuid] = true;
        return newState;
      });
    },
    blurByUuid: uuid => {
      set(() => {
        let newState = {};
        // @ts-ignore
        newState[uuid] = false;
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
            focusedEl:
              newIndex === -1 ? '' : state.focusableItems[newIndex].uuid,
          };
          if (newIndex !== -1) {
            // @ts-ignore
            newState[state.focusableItems[newIndex].uuid] = true;
            // @ts-ignore
            newState[state.focusableItems[state.currentIndex].uuid] = false;
          } else {
            // @ts-ignore
            newState[state.focusableItems[state.currentIndex].uuid] = false;
          }
          return newState;
        });
      }
    },
    addFocusable: item => {
      let currentId = get().currentId;
      set(state => {
        item.uuid = '_' + currentId;
        let newSate = {
          currentId: currentId + 1,
          focusableItems: [...state.focusableItems, item],
        };
        // @ts-ignore
        newSate['_' + currentId] = false;
        return newSate;
      });
      return '_' + currentId;
    },
    removeFocusable: uuid => {
      let prevState = get();
      let currentIndex = 0;
      //@ts-ignore if current uuid have focus, set
      if (prevState[uuid]) {
        currentIndex = -1;
      } else {
        currentIndex = prevState.currentIndex;
      }
      set(state => {
        state.focusableItems = state.focusableItems.filter(
          // @ts-ignore
          item => item.uuid !== uuid
        );
        // @ts-ignore
        delete state[uuid];
        state.currentIndex = currentIndex;
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
      //todo
      set(() => {
        return { requestedAnchorId: anchorid };
      });
    },
  };
});

export default useFocusStore;
