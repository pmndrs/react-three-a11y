import React, { useEffect, useRef, useState, useContext } from 'react';
import { useThree } from 'react-three-fiber';
import { Html } from '@react-three/drei/Html';
import useAnnounceStore from './announceStore';

interface Props {
  children: React.ReactNode;
  description: string;
  pressedDescription: string;
  activationMsg: string;
  deactivationMsg: string;
  tabIndex: number;
  href: string | undefined;
  role: 'button' | 'link' | 'content';
  showAltText: boolean;
  actionCall: () => void | undefined;
  focusCall: (...args: any[]) => void | undefined;
}

const constHiddenButScreenreadable = {
  opacity: 0,
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  overflow: 'hidden',
  transform: 'translateX(-50%) translateY(-50%)',
  display: 'inline-block',
  margin: 0,
  pointerEvents: 'none' as const,
};

const A11yContext = React.createContext({
  focus: false,
  hover: false,
  pressed: false,
});

A11yContext.displayName = 'A11yContext';

const useA11y = () => {
  return useContext(A11yContext);
};

export { useA11y };

export const A11y: React.FC<Props> = ({
  children,
  description,
  pressedDescription,
  activationMsg,
  deactivationMsg,
  tabIndex,
  href,
  role,
  showAltText,
  actionCall,
  focusCall,
  ...props
}) => {
  const [a11yState, setA11yState] = useState({
    hovered: false,
    focused: false,
    pressed: false,
  });

  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);

  const {
    gl: { domElement },
  } = useThree();

  // temporary fix to prevent error -> keep track of our component's mounted state
  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      domElement.style.cursor = 'default';
      componentIsMounted.current = false;
    };
  }, []); // Using an empty dependency array ensures this on

  React.Children.only(children);

  function handleBtnClick() {
    //msg is the same need to be clean for it to trigger again in case of multiple press in a row
    a11yScreenReader('');
    // @ts-ignore
    window.setTimeout(() => {
      a11yScreenReader(activationMsg);
    }, 100);
    if (typeof actionCall === 'function') actionCall();
  }

  function handleToggleBtnClick() {
    if (a11yState.pressed) {
      a11yScreenReader(deactivationMsg);
    } else {
      a11yScreenReader(activationMsg);
    }
    setA11yState({
      hovered: a11yState.hovered,
      focused: a11yState.focused,
      pressed: !a11yState.pressed,
    });
    if (typeof actionCall === 'function') actionCall();
  }

  const HtmlFocusableElement = (() => {
    if (role === 'button') {
      if (deactivationMsg || pressedDescription) {
        //btn has two distinct state
        return (
          <button
            r3f-a11y="true"
            aria-pressed={a11yState.pressed ? 'true' : 'false'}
            tabIndex={tabIndex ? tabIndex : 0}
            style={constHiddenButScreenreadable}
            onClick={() => handleToggleBtnClick()}
            onFocus={() => {
              if (typeof focusCall === 'function') focusCall();
              setA11yState({
                hovered: a11yState.hovered,
                focused: true,
                pressed: a11yState.pressed,
              });
            }}
            onBlur={() => {
              setA11yState({
                hovered: a11yState.hovered,
                focused: false,
                pressed: a11yState.pressed,
              });
            }}
          >
            {description}
          </button>
        );
      } else {
        //regular btn
        return (
          <button
            r3f-a11y="true"
            tabIndex={tabIndex ? tabIndex : 0}
            style={constHiddenButScreenreadable}
            onClick={() => handleBtnClick()}
            onFocus={() => {
              if (typeof focusCall === 'function') focusCall();
              setA11yState({
                hovered: a11yState.hovered,
                focused: true,
                pressed: a11yState.pressed,
              });
            }}
            onBlur={() => {
              setA11yState({
                hovered: a11yState.hovered,
                focused: false,
                pressed: a11yState.pressed,
              });
            }}
          >
            {description}
          </button>
        );
      }
    } else if (role === 'link') {
      return (
        <a
          r3f-a11y="true"
          style={constHiddenButScreenreadable}
          href={href}
          onClick={e => {
            e.preventDefault();
            if (typeof actionCall === 'function') actionCall();
          }}
          onFocus={() => {
            if (typeof focusCall === 'function') focusCall();
            setA11yState({
              hovered: a11yState.hovered,
              focused: true,
              pressed: a11yState.pressed,
            });
          }}
          onBlur={() => {
            setA11yState({
              hovered: a11yState.hovered,
              focused: false,
              pressed: a11yState.pressed,
            });
          }}
        >
          {description}
        </a>
      );
    } else {
      return (
        <dialog
          r3f-a11y="true"
          tabIndex={tabIndex ? tabIndex : 0}
          style={constHiddenButScreenreadable}
          onBlur={() => {
            setA11yState({
              hovered: a11yState.hovered,
              focused: false,
              pressed: a11yState.pressed,
            });
          }}
          onFocus={() => {
            if (typeof focusCall === 'function') focusCall();
            setA11yState({
              hovered: a11yState.hovered,
              focused: true,
              pressed: a11yState.pressed,
            });
          }}
        >
          <p>{description}</p>
        </dialog>
      );
    }
  })();

  let AltText = null;
  if (showAltText && a11yState.hovered) {
    AltText = (
      <div
        aria-hidden={true}
        style={{
          width: 'auto',
          maxWidth: '300px',
          display: 'block',
          position: 'absolute',
          top: '0px',
          left: '0px',
          transform: 'translate(-50%,-50%)',
          background: 'white',
          borderRadius: '4px',
          padding: '4px',
        }}
      >
        <p
          aria-hidden={true}
          style={{
            margin: '0px',
          }}
        >
          {description}
        </p>
      </div>
    );
  }

  return (
    <A11yContext.Provider
      value={{
        hover: a11yState.hovered,
        focus: a11yState.focused,
        pressed: a11yState.pressed,
      }}
    >
      <group
        {...props}
        onClick={() => {
          if (role === 'button') {
            if (deactivationMsg || pressedDescription) {
              handleToggleBtnClick();
            } else {
              handleBtnClick();
            }
          }
          if (typeof actionCall === 'function') actionCall();
        }}
        onPointerOver={() => {
          // @ts-ignore
          if (a11yState.pressed) {
            a11yScreenReader(pressedDescription);
          } else {
            a11yScreenReader(description);
          }
          if (role !== 'content') {
            domElement.style.cursor = 'pointer';
          }
          setA11yState({
            hovered: true,
            focused: a11yState.focused,
            pressed: a11yState.pressed,
          });
        }}
        onPointerOut={() => {
          a11yScreenReader('');
          // temporary fix to prevent error -> keep track of our component's mounted state
          if (componentIsMounted.current) {
            domElement.style.cursor = 'default';
            setA11yState({
              hovered: false,
              focused: a11yState.focused,
              pressed: a11yState.pressed,
            });
          }
        }}
      >
        {children}
        <Html
          style={{ pointerEvents: 'none', minWidth: '300px' }}
          position={
            // @ts-ignore
            children.props.position ? children.props.position : [0, 0, 0]
          }
        >
          {AltText}
          {HtmlFocusableElement}
        </Html>
      </group>
    </A11yContext.Provider>
  );
};
