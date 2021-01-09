import React, {
  MouseEvent,
  useEffect,
  useRef,
  useState,
  useContext,
} from 'react';
import { useThree } from 'react-three-fiber';
import useAnnounceStore from './announceStore';
import { Html } from '@react-three/drei';

interface Props {
  children: React.ReactNode;
  title: string;
  activationMsg: string;
  desactivationMsg: string;
  anchorId: string | undefined;
  href: string | undefined;
  role: 'button' | 'link' | 'content';
  actionCall: () => void;
  focusCall: (children: React.ReactNode) => void;
}

const constHiddenButScreenreadable = {
  userSelect: 'none',
  opacity: 0,
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  overflow: 'hidden',
  transform: 'translateX(-50%) translateY(-50%)',
  display: 'inline-block',
  margin: '0',
};

const A11yContext = React.createContext({ focus: false, hover: false });
A11yContext.displayName = 'A11yContext';

const useA11y = () => {
  return useContext(A11yContext);
};

export { useA11y };

export const A11y: React.FC<Props> = ({
  children,
  title,
  activationMsg,
  desactivationMsg,
  anchorId,
  href,
  role,
  actionCall,
  focusCall,
  ...props
}) => {
  const [a11yState, setA11yState] = useState({
    hovered: false,
    focused: false,
  });
  const a11yScreenReader = useAnnounceStore(state => state.a11yScreenReader);

  if (a11yState) {
    // @ts-ignore
    console.log('rendering ' + a11yState.uuid);
  }

  const {
    gl: { domElement },
  } = useThree();

  // temporary fix to prevent error -> keep track of our component's mounted state
  const componentIsMounted = useRef(true);
  useEffect(() => {
    console.log('mounting' + title);
    return () => {
      console.log('unmounting' + title);
      domElement.style.cursor = 'default';
      componentIsMounted.current = false;
    };
  }, []); // Using an empty dependency array ensures this on

  if (a11yState.hovered) {
    domElement.style.cursor = 'pointer';
  } else {
    domElement.style.cursor = 'default';
  }

  React.Children.only(children);

  function handleBtnClick() {
    //msg is the same need to be clean for it to trigger again in case of multiple press in a row
    a11yScreenReader('');
    window.setTimeout(() => {
      // @ts-ignore
      a11yScreenReader(activationMsg);
    }, 10);
    // @ts-ignore
    actionCall();
  }

  function handleToggleBtnClick(
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) {
    // @ts-ignore
    if (e.target.getAttribute('aria-pressed') === 'true') {
      // @ts-ignore
      e.target.setAttribute('aria-pressed', 'false');
      // @ts-ignore
      a11yScreenReader(desactivationMsg);
    } else {
      // @ts-ignore
      e.target.setAttribute('aria-pressed', 'true');
      // @ts-ignore
      a11yScreenReader(activationMsg);
    }
    // @ts-ignore
    actionCall();
  }

  const HtmlFocusableElement = (() => {
    if (role === 'button') {
      if (desactivationMsg) {
        //btn has two distinct state
        return (
          <button
            aria-pressed="false"
            // @ts-ignore
            style={constHiddenButScreenreadable}
            onClick={e => handleToggleBtnClick(e)}
            onFocus={() => {
              setA11yState({
                hovered: a11yState.hovered,
                focused: true,
              });
            }}
            onBlur={() => {
              setA11yState({
                hovered: a11yState.hovered,
                focused: false,
              });
            }}
          >
            {title}
          </button>
        );
      } else {
        //regular btn
        return (
          <button
            // @ts-ignore
            style={constHiddenButScreenreadable}
            // @ts-ignore
            onClick={() => handleBtnClick()}
            onFocus={() => {
              setA11yState({
                hovered: a11yState.hovered,
                focused: true,
              });
            }}
            onBlur={() => {
              setA11yState({
                hovered: a11yState.hovered,
                focused: false,
              });
            }}
          >
            {title}
          </button>
        );
      }
    } else if (role === 'link') {
      return (
        <a
          // @ts-ignore
          style={constHiddenButScreenreadable}
          href={href}
          // @ts-ignore
          onClick={e => {
            e.preventDefault();
            actionCall();
          }}
          onFocus={() => {
            setA11yState({
              hovered: a11yState.hovered,
              focused: true,
            });
          }}
          onBlur={() => {
            setA11yState({
              hovered: a11yState.hovered,
              focused: false,
            });
          }}
        >
          {title}
        </a>
      );
    } else {
      return (
        <p
          // @ts-ignore
          style={constHiddenButScreenreadable}
          tabIndex={0}
          onBlur={() => {
            setA11yState({
              hovered: a11yState.hovered,
              focused: false,
            });
          }}
          onFocus={() => {
            setA11yState({
              hovered: a11yState.hovered,
              focused: true,
            });
          }}
        >
          {title}
        </p>
      );
    }
  })();

  return (
    <A11yContext.Provider
      value={{ hover: a11yState.hovered, focus: a11yState.focused }}
    >
      <group
        {...props}
        onClick={actionCall}
        onPointerOver={() =>
          setA11yState({
            hovered: true,
            focused: a11yState.focused,
          })
        }
        onPointerOut={() => {
          // temporary fix to prevent error -> keep track of our component's mounted state
          if (componentIsMounted.current) {
            setA11yState({
              hovered: false,
              focused: a11yState.focused,
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
          {HtmlFocusableElement}
        </Html>
      </group>
    </A11yContext.Provider>
  );
};
