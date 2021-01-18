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
  disabled: boolean;
  debug: boolean;
  a11yElStyle: Object;
}

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
  disabled,
  debug,
  a11yElStyle,
  ...props
}) => {
  let constHiddenButScreenreadable = Object.assign(
    {
      opacity: debug ? 1 : 0,
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      overflow: 'hidden',
      transform: 'translateX(-50%) translateY(-50%)',
      display: 'inline-block',
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      WebkitTouchCallout: 'none' as const,
      margin: 0,
    },
    a11yElStyle
  );

  const [a11yState, setA11yState] = useState({
    hovered: false,
    focused: false,
    pressed: false,
  });

  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);

  const overHtml = useRef(false);
  const overMesh = useRef(false);
  const didMouseOverAnnounce = useRef(false);

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
  // @ts-ignore
  const handleOnPointerOver = e => {
    if (e.eventObject) {
      overMesh.current = true;
    } else {
      overHtml.current = true;
    }
    if (overHtml.current || overMesh.current) {
      // @ts-ignore
      if (didMouseOverAnnounce.current) {
        return;
      }
      if (a11yState.pressed) {
        didMouseOverAnnounce.current = true;
        a11yScreenReader(pressedDescription);
      } else {
        didMouseOverAnnounce.current = true;
        a11yScreenReader(description);
      }
      if (role !== 'content' && !disabled) {
        domElement.style.cursor = 'pointer';
      }
      //@ts-ignore
      setA11yState({
        hovered: true,
        focused: a11yState.focused,
        pressed: a11yState.pressed,
      });
    }
  };
  // @ts-ignore
  const handleOnPointerOut = e => {
    if (e.eventObject) {
      overMesh.current = false;
    } else {
      overHtml.current = false;
    }
    if (!overHtml.current && !overMesh.current) {
      didMouseOverAnnounce.current = false;
      if (componentIsMounted.current) {
        domElement.style.cursor = 'default';
        //@ts-ignore
        setA11yState({
          hovered: false,
          focused: a11yState.focused,
          pressed: a11yState.pressed,
        });
      }
    }
    a11yScreenReader('');
  };

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
    //@ts-ignore
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
            aria-disabled={disabled ? 'true' : 'false'}
            aria-pressed={a11yState.pressed ? 'true' : 'false'}
            tabIndex={tabIndex ? tabIndex : 0}
            style={Object.assign(
              constHiddenButScreenreadable,
              disabled ? { cursor: 'default' } : { cursor: 'pointer' }
            )}
            onPointerOver={handleOnPointerOver}
            onPointerOut={handleOnPointerOut}
            onClick={e => {
              e.stopPropagation();
              if (disabled) {
                return;
              }
              handleToggleBtnClick();
            }}
            onFocus={() => {
              if (typeof focusCall === 'function') focusCall();
              //@ts-ignore
              setA11yState({
                hovered: a11yState.hovered,
                focused: true,
                pressed: a11yState.pressed,
              });
            }}
            onBlur={() => {
              //@ts-ignore
              setA11yState({
                hovered: a11yState.hovered,
                focused: false,
                pressed: a11yState.pressed,
              });
            }}
          >
            {didMouseOverAnnounce.current ? '' : description}
          </button>
        );
      } else {
        //regular btn
        return (
          <button
            r3f-a11y="true"
            aria-disabled={disabled ? 'true' : 'false'}
            tabIndex={tabIndex ? tabIndex : 0}
            style={Object.assign(
              constHiddenButScreenreadable,
              disabled ? { cursor: 'default' } : { cursor: 'pointer' }
            )}
            onPointerOver={handleOnPointerOver}
            onPointerOut={handleOnPointerOut}
            onClick={e => {
              e.stopPropagation();
              if (disabled) {
                return;
              }
              handleBtnClick();
            }}
            onFocus={() => {
              if (typeof focusCall === 'function') focusCall();
              //@ts-ignore
              setA11yState({
                hovered: a11yState.hovered,
                focused: true,
                pressed: a11yState.pressed,
              });
            }}
            onBlur={() => {
              //@ts-ignore
              setA11yState({
                hovered: a11yState.hovered,
                focused: false,
                pressed: a11yState.pressed,
              });
            }}
          >
            {didMouseOverAnnounce.current ? '' : description}
          </button>
        );
      }
    } else if (role === 'link') {
      return (
        <a
          r3f-a11y="true"
          style={constHiddenButScreenreadable}
          href={href}
          onPointerOver={handleOnPointerOver}
          onPointerOut={handleOnPointerOut}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (typeof actionCall === 'function') actionCall();
          }}
          onFocus={() => {
            if (typeof focusCall === 'function') focusCall();
            //@ts-ignore
            setA11yState({
              hovered: a11yState.hovered,
              focused: true,
              pressed: a11yState.pressed,
            });
          }}
          onBlur={() => {
            //@ts-ignore
            setA11yState({
              hovered: a11yState.hovered,
              focused: false,
              pressed: a11yState.pressed,
            });
          }}
        >
          {didMouseOverAnnounce.current ? '' : description}
        </a>
      );
    } else {
      return (
        <p
          r3f-a11y="true"
          tabIndex={tabIndex ? tabIndex : 0}
          style={constHiddenButScreenreadable}
          onPointerOver={handleOnPointerOver}
          onPointerOut={handleOnPointerOut}
          onBlur={() => {
            //@ts-ignore
            setA11yState({
              hovered: a11yState.hovered,
              focused: false,
              pressed: a11yState.pressed,
            });
          }}
          onFocus={() => {
            if (typeof focusCall === 'function') focusCall();
            //@ts-ignore
            setA11yState({
              hovered: a11yState.hovered,
              focused: true,
              pressed: a11yState.pressed,
            });
          }}
        >
          {didMouseOverAnnounce.current ? '' : description}
        </p>
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
          {didMouseOverAnnounce.current ? '' : description}
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
        onClick={e => {
          e.stopPropagation();
          if (disabled) {
            return;
          }
          if (role === 'button') {
            if (deactivationMsg || pressedDescription) {
              handleToggleBtnClick();
            } else {
              handleBtnClick();
            }
          }
          if (typeof actionCall === 'function') actionCall();
        }}
        onPointerOver={handleOnPointerOver}
        onPointerOut={handleOnPointerOut}
      >
        {children}
        <Html
          style={{ width: '0px' }}
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
