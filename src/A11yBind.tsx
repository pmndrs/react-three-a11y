import React, { useEffect, useRef, useState, useContext } from 'react';
import useAnnounceStore from './announceStore';
import { stylesHiddenButScreenreadable } from './A11yConsts';
import { HtmlBind } from './HtmlBind';
import isDeepEqual from 'fast-deep-equal/react';

interface Props {
  children: React.ReactNode;
  bind: string;
  textContent: string;
  focusCall?: (...args: any[]) => any;
  debug?: boolean;
  a11yElStyle?: Object;
  a11yElAttr?: Object;
  hidden?: boolean;
  activationMsg?: string;
  actionCall?: () => any;
  disabled?: boolean;
  showPointer?: boolean;
}

const A11yContext = React.createContext({
  focus: false,
  hover: false,
});

A11yContext.displayName = 'A11yContext';

const useA11yBind = () => {
  return useContext(A11yContext);
};

export { useA11yBind };

export const A11yBind: React.FC<Props> = ({
  children,
  bind,
  textContent,
  activationMsg,
  actionCall,
  focusCall,
  disabled,
  debug = false,
  a11yElStyle,
  a11yElAttr,
  hidden = false,
  showPointer = false,
  ...props
}) => {
  const bindedEl = useRef<HTMLElement | null>(null);

  let constHiddenButScreenreadable = Object.assign(
    {},
    stylesHiddenButScreenreadable,
    { opacity: debug ? 1 : 0 },
    a11yElStyle
  );

  const a11yElAttrRef = useRef(a11yElAttr);
  if (!isDeepEqual(a11yElAttrRef.current, a11yElAttr)) {
    a11yElAttrRef.current = a11yElAttr;
  }

  const [a11yState, setA11yState] = useState({
    hovered: false,
    focused: false,
  });

  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);

  const overHtml = useRef(false);
  const overMesh = useRef(false);

  const documentElement = document.documentElement;

  const componentIsMounted = useRef(true);
  useEffect(() => {
    bindedEl.current = document.getElementById(bind);
    editEl();
    return () => {
      bindedEl.current = null;
      documentElement.style.cursor = 'default';
      componentIsMounted.current = false;
    };
  }, [bind]);

  // @ts-ignore
  const handleOnPointerOver = e => {
    if (e.eventObject) {
      overMesh.current = true;
    } else {
      overHtml.current = true;
    }
    if (overHtml.current || overMesh.current) {
      if (
        bindedEl.current?.tagName === 'A' ||
        bindedEl.current?.tagName === 'BUTTON' ||
        showPointer
      ) {
        documentElement.style.cursor = 'pointer';
      }
      setA11yState({
        hovered: true,
        focused: a11yState.focused,
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
      if (componentIsMounted.current) {
        documentElement.style.cursor = 'default';
        setA11yState({
          hovered: false,
          focused: a11yState.focused,
        });
      }
    }
  };

  const editEl = () => {
    if (bindedEl.current) {
      if (bindedEl.current.tagName === 'IMG')
        bindedEl.current.setAttribute(
          'src',
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        );
      bindedEl.current.setAttribute('data-r3f-a11y', 'true');
      if (a11yElAttr) {
        for (const property in a11yElAttr) {
          bindedEl.current.setAttribute(
            property.replace(/[A-Z]/g, m => '-' + m.toLowerCase()),
            //@ts-ignore
            a11yElAttr[property]
          );
        }
      }
      const styles = Object.assign(
        constHiddenButScreenreadable,
        hidden
          ? { visibility: 'hidden' as const }
          : { visibility: 'visible' as const }
      );
      Object.keys(styles).forEach((key: string) => {
        bindedEl.current?.style.setProperty(
          key.replace(/[A-Z]/g, m => '-' + m.toLowerCase()),
          //@ts-ignore
          styles[key]
        );
      });
      if (textContent) bindedEl.current.textContent = textContent;
      bindedEl.current.onpointerover = handleOnPointerOver;
      bindedEl.current.onpointerout = handleOnPointerOut;
      bindedEl.current.onclick = e => {
        e.stopPropagation();
        if (disabled) {
          return;
        }
        if (typeof actionCall === 'function') actionCall();
        a11yScreenReader('');
        window.setTimeout(() => {
          if (typeof activationMsg === 'string')
            a11yScreenReader(activationMsg);
        }, 100);
      };
      bindedEl.current.onfocus = () => {
        if (typeof focusCall === 'function') focusCall();
        setA11yState({
          hovered: a11yState.hovered,
          focused: true,
        });
      };
      bindedEl.current.onblur = () => {
        setA11yState({
          hovered: a11yState.hovered,
          focused: false,
        });
      };
    }
  };

  editEl();

  React.Children.only(children);

  return (
    <A11yContext.Provider
      value={{
        hover: a11yState.hovered,
        focus: a11yState.focused,
      }}
    >
      <group
        {...props}
        onClick={e => {
          e.stopPropagation();
          if (disabled) {
            return;
          }
          if (typeof actionCall === 'function') actionCall();
        }}
        onPointerOver={handleOnPointerOver}
        onPointerOut={handleOnPointerOut}
        // visible={!hidden}
      >
        {children}
        <HtmlBind
          style={{ width: '0px' }}
          position={
            // @ts-ignore
            children.props.position ? children.props.position : 0
          }
          target={bindedEl}
        ></HtmlBind>
      </group>
    </A11yContext.Provider>
  );
};
