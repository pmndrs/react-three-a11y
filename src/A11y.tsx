import React, { useEffect, useRef, useState, useContext } from 'react';
import { useThree } from '@react-three/fiber';
import useAnnounceStore from './announceStore';
import { useA11ySectionContext } from './A11ySection';
import { stylesHiddenButScreenreadable } from './A11yConsts';
import { Html } from './Html';

interface A11yCommonProps {
  role: 'button' | 'togglebutton' | 'link' | 'content' | 'image';
  children: React.ReactNode;
  description: string;
  tabIndex?: number;
  showAltText?: boolean;
  focusCall?: (...args: any[]) => any;
  debug?: boolean;
  a11yElStyle?: Object;
  hidden?: boolean;
  dragThreshold?: number;
}

type RoleProps =
  | {
      role: 'content';
      activationMsg?: never;
      deactivationMsg?: never;
      actionCall?: never;
      href?: never;
      disabled?: never;
      startPressed?: never;
      tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    }
  | {
      role: 'button';
      activationMsg?: string;
      deactivationMsg?: never;
      actionCall?: () => any;
      href?: never;
      disabled?: boolean;
      startPressed?: never;
      tag?: never;
    }
  | {
      role: 'togglebutton';
      activationMsg?: string;
      deactivationMsg?: string;
      actionCall?: () => any;
      href?: never;
      disabled?: boolean;
      startPressed?: boolean;
      tag?: never;
    }
  | {
      role: 'link';
      activationMsg?: never;
      deactivationMsg?: never;
      actionCall: () => any;
      href: string;
      disabled?: never;
      startPressed?: never;
      tag?: never;
    }
  | {
      role: 'image';
      activationMsg?: never;
      deactivationMsg?: never;
      actionCall?: never;
      href?: never;
      disabled?: never;
      startPressed?: never;
      tag?: never;
    };

type Props = A11yCommonProps & RoleProps;

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
  activationMsg,
  deactivationMsg,
  tabIndex,
  href,
  role,
  showAltText = false,
  actionCall,
  focusCall,
  disabled,
  debug = false,
  a11yElStyle,
  startPressed = false,
  tag = 'p',
  hidden = false,
  dragThreshold,
  ...props
}) => {
  let constHiddenButScreenreadable = Object.assign(
    {},
    stylesHiddenButScreenreadable,
    { opacity: debug ? 1 : 0 },
    a11yElStyle
  );

  const [a11yState, setA11yState] = useState({
    hovered: false,
    focused: false,
    pressed: startPressed ? startPressed : false,
  });

  const a11yScreenReader = useAnnounceStore((state) => state.a11yScreenReader);

  const overHtml = useRef(false);
  const overMesh = useRef(false);

  const domElement = useThree((state) => state.gl.domElement);

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
  const handleOnPointerOver = (e) => {
    if (e.eventObject) {
      overMesh.current = true;
    } else {
      overHtml.current = true;
    }
    if (overHtml.current || overMesh.current) {
      if (role !== 'content' && role !== 'image' && !disabled) {
        domElement.style.cursor = 'pointer';
      }
      setA11yState({
        hovered: true,
        focused: a11yState.focused,
        pressed: a11yState.pressed,
      });
    }
  };
  // @ts-ignore
  const handleOnPointerOut = (e) => {
    if (e.eventObject) {
      overMesh.current = false;
    } else {
      overHtml.current = false;
    }
    if (!overHtml.current && !overMesh.current) {
      if (componentIsMounted.current) {
        domElement.style.cursor = 'default';
        setA11yState({
          hovered: false,
          focused: a11yState.focused,
          pressed: a11yState.pressed,
        });
      }
    }
  };

  function handleBtnClick() {
    //msg is the same need to be clean for it to trigger again in case of multiple press in a row
    a11yScreenReader('');
    window.setTimeout(() => {
      if (typeof activationMsg === 'string') a11yScreenReader(activationMsg);
    }, 100);
    if (typeof actionCall === 'function') actionCall();
  }

  function handleToggleBtnClick() {
    if (a11yState.pressed) {
      if (typeof deactivationMsg === 'string')
        a11yScreenReader(deactivationMsg);
    } else {
      if (typeof activationMsg === 'string') a11yScreenReader(activationMsg);
    }
    setA11yState({
      hovered: a11yState.hovered,
      focused: a11yState.focused,
      pressed: !a11yState.pressed,
    });
    if (typeof actionCall === 'function') actionCall();
  }

  const returnHtmlA11yEl = () => {
    if (role === 'button' || role === 'togglebutton') {
      let disabledBtnAttr = disabled
        ? {
            disabled: true,
          }
        : null;
      if (role === 'togglebutton') {
        return (
          <button
            r3f-a11y="true"
            {...disabledBtnAttr}
            aria-pressed={a11yState.pressed ? 'true' : 'false'}
            tabIndex={tabIndex ? tabIndex : 0}
            style={Object.assign(
              constHiddenButScreenreadable,
              disabled ? { cursor: 'default' } : { cursor: 'pointer' },
              hidden
                ? { visibility: 'hidden' as const }
                : { visibility: 'visible' as const }
            )}
            onPointerOver={handleOnPointerOver}
            onPointerOut={handleOnPointerOut}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) {
                return;
              }
              handleToggleBtnClick();
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
          </button>
        );
      } else {
        //regular btn
        return (
          <button
            r3f-a11y="true"
            {...disabledBtnAttr}
            tabIndex={tabIndex ? tabIndex : 0}
            style={Object.assign(
              constHiddenButScreenreadable,
              disabled ? { cursor: 'default' } : { cursor: 'pointer' },
              hidden
                ? { visibility: 'hidden' as const }
                : { visibility: 'visible' as const }
            )}
            onPointerOver={handleOnPointerOver}
            onPointerOut={handleOnPointerOut}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) {
                return;
              }
              handleBtnClick();
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
          </button>
        );
      }
    } else if (role === 'link') {
      return (
        <a
          r3f-a11y="true"
          style={Object.assign(
            constHiddenButScreenreadable,
            hidden
              ? { visibility: 'hidden' as const }
              : { visibility: 'visible' as const }
          )}
          href={href}
          onPointerOver={handleOnPointerOver}
          onPointerOut={handleOnPointerOut}
          onClick={(e) => {
            e.stopPropagation();
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
      let tabIndexP = tabIndex
        ? {
            tabIndex: tabIndex,
          }
        : null;
      if (role === 'image') {
        return (
          <img
            r3f-a11y="true"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
            alt={description}
            {...tabIndexP}
            style={Object.assign(
              constHiddenButScreenreadable,
              hidden
                ? { visibility: 'hidden' as const }
                : { visibility: 'visible' as const }
            )}
            onPointerOver={handleOnPointerOver}
            onPointerOut={handleOnPointerOut}
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
          />
        );
      } else {
        const Tag = tag;
        return (
          <Tag
            r3f-a11y="true"
            {...tabIndexP}
            style={Object.assign(
              constHiddenButScreenreadable,
              hidden
                ? { visibility: 'hidden' as const }
                : { visibility: 'visible' as const }
            )}
            onPointerOver={handleOnPointerOver}
            onPointerOut={handleOnPointerOut}
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
            {description}
          </Tag>
        );
      }
    }
  };

  const HtmlAccessibleElement = React.useMemo(returnHtmlA11yEl, [
    description,
    a11yState,
    hidden,
    tabIndex,
    href,
    disabled,
    startPressed,
    tag,
    actionCall,
    focusCall,
  ]);

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

  const section = useA11ySectionContext();
  let portal = {};
  if (section.current instanceof HTMLElement) {
    portal = { portal: section };
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
        onClick={(e) => {
          e.stopPropagation();
          if (disabled || (dragThreshold && e.delta > dragThreshold)) {
            return;
          }
          if (role === 'button') {
            handleBtnClick();
          } else if (role === 'togglebutton') {
            handleToggleBtnClick();
          } else {
            if (typeof actionCall === 'function') actionCall();
          }
        }}
        onPointerOver={handleOnPointerOver}
        onPointerOut={handleOnPointerOut}
      >
        {children}
        <Html
          style={{ width: '0px' }}
          position={
            // @ts-ignore
            children.props.position ? children.props.position : 0
          }
          {...portal}
        >
          {AltText}
          {HtmlAccessibleElement}
        </Html>
      </group>
    </A11yContext.Provider>
  );
};
