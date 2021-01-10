import React, { useEffect, useRef, useState, useContext } from 'react';
import { useThree } from 'react-three-fiber';
import { Html } from '@react-three/drei';
import useAnnounceStore from './announceStore';

interface Props {
  children: React.ReactNode;
  description: string;
  pressedDescription: string;
  activationMsg: string;
  desactivationMsg: string;
  tabIndex: number;
  href: string | undefined;
  role: 'button' | 'link' | 'content';
  showAltText: boolean;
  actionCall: () => void;
  focusCall: (children: React.ReactNode) => void;
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
  desactivationMsg,
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
    console.log('mounting' + description);
    return () => {
      console.log('unmounting' + description);
      domElement.style.cursor = 'default';
      componentIsMounted.current = false;
    };
  }, []); // Using an empty dependency array ensures this on

  if (a11yState.hovered && role != 'content') {
    domElement.style.cursor = 'pointer';
  } else {
    domElement.style.cursor = 'default';
  }

  React.Children.only(children);

  function handleBtnClick() {
    //msg is the same need to be clean for it to trigger again in case of multiple press in a row
    a11yScreenReader('');
    // @ts-ignore
    window.setTimeout(() => {
      console.log('should say ' + activationMsg);
      a11yScreenReader(activationMsg);
    }, 100);
    actionCall();
  }

  function handleToggleBtnClick() {
    if (a11yState.pressed) {
      a11yScreenReader(desactivationMsg);
    } else {
      a11yScreenReader(activationMsg);
    }
    setA11yState({
      hovered: a11yState.hovered,
      focused: a11yState.focused,
      pressed: !a11yState.pressed,
    });
    actionCall();
  }

  const HtmlFocusableElement = (() => {
    if (role === 'button') {
      if (desactivationMsg) {
        //btn has two distinct state
        return (
          <button
            aria-pressed={a11yState.pressed ? 'true' : 'false'}
            tabIndex={tabIndex ? tabIndex : 0}
            style={constHiddenButScreenreadable}
            onClick={() => handleToggleBtnClick()}
            onFocus={() => {
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
            tabIndex={tabIndex ? tabIndex : 0}
            style={constHiddenButScreenreadable}
            onClick={() => handleBtnClick()}
            onFocus={() => {
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
          style={constHiddenButScreenreadable}
          href={href}
          onClick={e => {
            e.preventDefault();
            actionCall();
          }}
          onFocus={() => {
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
            setA11yState({
              hovered: a11yState.hovered,
              focused: true,
              pressed: a11yState.pressed,
            });
          }}
        >
          {description}
        </dialog>
      );
    }
  })();

  let AltText = null;
  if (showAltText && a11yState.hovered) {
    AltText = (
      <div
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
            if (desactivationMsg) {
              handleBtnClick();
            } else {
              handleToggleBtnClick();
            }
          }
          actionCall();
        }}
        onPointerOver={() => {
          // @ts-ignore
          if (a11yState.pressed) {
            a11yScreenReader(pressedDescription);
          } else {
            a11yScreenReader(description);
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
          style={{ pointerEvents: 'none' }}
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
